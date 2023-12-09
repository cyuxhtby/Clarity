importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: 'AIzaSyDZkOhH9pQhqYga6Q9VlPIeAnqhWRja8DI',
  authDomain: 'clarity-e78d7.firebaseapp.com',
  projectId: 'clarity-e78d7',
  storageBucket: 'clarity-e78d7.appspot.com',
  messagingSenderId: '380077709020',
  appId: '1:380077709020:web:dbc0ea6d7eb47383d3c619',
  measurementId: 'G-RZFMVFJ91V',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});