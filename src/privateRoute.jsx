import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if(loading) {
        return <h3>Loading ...</h3>
    }

    if(!user) {
        return <Navigate to = "/login" replace />
    }

    return children;
};

export default PrivateRoute;