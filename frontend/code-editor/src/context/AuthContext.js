import React, { createContext, useState, useEffect } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../utils/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            // Set the current user here
            setCurrentUser(userCredential.user);
            return userCredential.user;
        });;
    };

    const signup = async (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            // Set the current user here
            setCurrentUser(userCredential.user);
            return userCredential.user;
        });
    };

    const logout = () => {
        return auth.signOut();
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false); // Ensure loading is false even if there's an error.
        });

        return unsubscribe; // This will unsubscribe on unmount
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
