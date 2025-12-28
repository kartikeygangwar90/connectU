import { createContext, useContext, useEffect } from "react";
import React from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
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
        <AuthContext.Provider value = { value } >
            {!loading && children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};