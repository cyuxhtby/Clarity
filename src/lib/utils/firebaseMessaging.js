'use client'

import { firestore, auth, initFirebaseMessaging } from './firebaseConfig'; 
import { getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { VAPID_KEY } from './environment'

export async function requestPermission() {
  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Messaging is not supported in this browser.');
    return;
  }
  console.log('Requesting notification permission');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission denied or dismissed by the user.');
    return;
  }
  console.log('Notification permission granted.');
  console.log("Checking service worker registration...");
  const registration = await navigator.serviceWorker.ready;
  const messaging = getMessaging(registration);
  const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
  if (currentToken) {
    console.log('FCM Token:', currentToken); // leave for now
    await sendTokenToServer(currentToken, auth.currentUser.uid);
  } else {
    console.log('No registration token available. Request permission to generate one.');
  }
}

export async function onMessageListener() {
  const messagingInstance = await initFirebaseMessaging();
  if (messagingInstance) {
    console.log("Message listener here");
    onMessage(messagingInstance, (payload) => {
      console.log('Message received. ', payload);
    });
  }
}

export async function onTokenRefresh() {
  const messagingInstance = await initFirebaseMessaging();
  if (!messagingInstance) {
    console.warn('Firebase Messaging is not supported by this browser or failed to initialize.');
    return;
  }
  getToken(messagingInstance, { vapidKey: VAPID_KEY }).then((currentToken) => {
    if (currentToken) {
      console.log('Token obtained or refreshed:', currentToken);
      if (auth.currentUser) {
        sendTokenToServer(currentToken, auth.currentUser.uid);
      }
    } else {
      console.warn('No registration token available. Request permission to generate one.');
    }
  }).catch((err) => {
    console.error('Unable to retrieve token ', err);
  });
}

async function sendTokenToServer(currentToken, userId) {
  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Messaging is not supported in this browser.');
    return;
  }
  const tokenDocRef = doc(firestore, 'users', userId, 'tokens', currentToken);
  try {
    await setDoc(tokenDocRef, { token: currentToken, updatedAt: new Date() }, { merge: true });
    console.log('FCM token stored in Firestore for user:', userId);
  } catch (error) {
    console.error('Error storing FCM token in Firestore for user:', userId, error);
  }
}
