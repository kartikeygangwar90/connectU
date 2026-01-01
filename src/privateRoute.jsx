import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { doc, getDoc } from "firebase/firestore"
import { dataBase } from "./firebase";
import { useEffect } from "react";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [checking, setChecking] = React.useState(true);
    const [profileCompleted, setProfileCompleted] = React.useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            if(!user) {
                setChecking(false)
                return;
            }

            const userRef = doc(dataBase, "users", user.uid);

            const snap = await getDoc(userRef);

            setProfileCompleted(!!snap.data()?.profileCompleted);

            setChecking(false);
        };
        if(!loading) checkProfile();;
    }, [user, loading]);



    if(loading || checking) return <h3>Loading ...</h3>

    if(!user) return <Navigate to = "/login" replace />

    if(!profileCompleted) return <Navigate to = "/profile" replace />

    return children;
};

export default PrivateRoute;