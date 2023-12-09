import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDZkOhH9pQhqYga6Q9VlPIeAnqhWRja8DI',
  authDomain: 'clarity-e78d7.firebaseapp.com',
  projectId: 'clarity-e78d7',
  storageBucket: 'clarity-e78d7.appspot.com',
  messagingSenderId: '380077709020',
  appId: '1:380077709020:web:dbc0ea6d7eb47383d3c619',
  measurementId: 'G-RZFMVFJ91V',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

let messagingInstance;
let analytics;

// Initialize messaging if supported
export const initFirebaseMessaging = async () => {
  const supported = await isSupported();
  if (supported && typeof window !== 'undefined') {
    messagingInstance = getMessaging(app);
  } else {
    console.warn('Firebase Messaging is not supported in this browser.');
  }
  return messagingInstance;
};

// Initialize analytics if supported and in a browser context
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, app, firestore, analytics, messagingInstance };
