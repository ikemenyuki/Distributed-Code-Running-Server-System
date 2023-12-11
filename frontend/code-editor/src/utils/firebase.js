import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBo7cAFBE5O5FlXtklRGQqNlbLFxYKNMBw",
    authDomain: "dcrss-msin-cmu.firebaseapp.com",
    projectId: "dcrss-msin-cmu",
    storageBucket: "dcrss-msin-cmu.appspot.com",
    messagingSenderId: "121680798059",
    appId: "1:121680798059:web:963b3ba5c9eaaf64e42c2e",
    measurementId: "G-Y1BLWVLJYP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get the Firebase auth instance
const auth = getAuth(app);

export { auth, app, createUserWithEmailAndPassword, signInWithEmailAndPassword };

