import React, { useEffect } from 'react';
import firebase from '../utils/firebase'; // Import firebase with compat
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import 'firebaseui/dist/firebaseui.css';

// Configure FirebaseUI.
const uiConfig = {
  signInFlow: 'popup', // or 'redirect'
  signInOptions: [
    // List the authentication providers you want to use.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

const FirebaseAuth = () => {
  useEffect(() => {
    // Cleanup function if necessary for FirebaseUI
    return () => {
      if (window.firebaseui && window.firebaseui.auth.AuthUI.getInstance()) {
        const ui = window.firebaseui.auth.AuthUI.getInstance();
        ui.delete();
      }
    };
  }, []);

  return (
    <div>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
};

export default FirebaseAuth;
