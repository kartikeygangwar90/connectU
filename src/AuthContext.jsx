/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from "react";
import React from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "./firebase";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { dataBase } from "./firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }

    const logOut = () => {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                setUser(currentUser);

                if (currentUser) {
                    const userRef = doc(dataBase, "users", currentUser.uid);
                    const snap = await getDoc(userRef);

                    // creating doc for first time ----->
                    if (!snap.exists()) {
                        await setDoc(userRef, {
                            email: currentUser.email,
                            profileCompleted: false,
                            createdAt: serverTimestamp(),
                        });
                    }
                }
            } catch (error) {
                console.error("Auth Error", error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        loading,
        login,
        signup,
        logOut
    };

    return (
        <AuthContext.Provider value={value} >
            {!loading && children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};