/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from "react";
import React from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth } from "./firebase";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { dataBase } from "./firebase";

const AuthContext = createContext();

// Initialize OAuth providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account' // Always show account picker
});

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email'); // Request email access

export const AuthProvider = ({ children }) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        return result;
    }

    const loginWithGithub = async () => {
        const result = await signInWithPopup(auth, githubProvider);
        return result;
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
                        // Get display name and photo from OAuth provider (if available)
                        const displayName = currentUser.displayName || "";
                        const photoURL = currentUser.photoURL || "";

                        await setDoc(userRef, {
                            email: currentUser.email,
                            fullName: displayName,
                            photoURL: photoURL,
                            profileCompleted: false,
                            createdAt: serverTimestamp(),
                            // Store auth provider info
                            authProvider: currentUser.providerData[0]?.providerId || "email"
                        });
                    } else {
                        // If user exists but doesn't have photoURL, update it from OAuth
                        const userData = snap.data();
                        if (!userData.photoURL && currentUser.photoURL) {
                            await setDoc(userRef, {
                                photoURL: currentUser.photoURL
                            }, { merge: true });
                        }
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
        loginWithGoogle,
        loginWithGithub,
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