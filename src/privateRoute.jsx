import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { dataBase } from "./firebase";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const userRef = doc(dataBase, "users", user.uid);
        const snap = await getDoc(userRef);
        setProfileCompleted(!!snap.data()?.profileCompleted);
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkProfile();
    }
  }, [user, loading]);

  // Show loading state
  if (loading || checking) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
          background: "#f9fafb",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e5e7eb",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>Loading...</p>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to profile setup if profile not completed
  if (!profileCompleted) {
    return <Navigate to="/profile" replace />;
  }

  // Render protected content
  return children;
};

export default PrivateRoute;
