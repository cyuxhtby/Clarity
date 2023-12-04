import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export { auth, app, firestore };
