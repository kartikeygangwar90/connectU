import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { sendEmailVerification } from "firebase/auth";
import toast from "react-hot-toast";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [resending, setResending] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
          background: "#000",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ color: "#a1a1aa", fontSize: "0.95rem" }}>Loading...</p>
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

  // Check email verification
  if (!user.emailVerified) {
    const handleResendVerification = async () => {
      setResending(true);
      try {
        await sendEmailVerification(user);
        toast.success("Verification email sent! Check your inbox.");
      } catch (error) {
        console.error("Error sending verification email:", error);
        if (error.code === "auth/too-many-requests") {
          toast.error("Too many requests. Please wait a few minutes.");
        } else {
          toast.error("Failed to send verification email. Try again later.");
        }
      } finally {
        setResending(false);
      }
    };

    const handleRefresh = () => {
      // Reload the page to check verification status
      window.location.reload();
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1.5rem",
          background: "#000",
          padding: "2rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1.5rem",
            padding: "3rem 2rem",
            maxWidth: "450px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2.5rem",
            }}
          >
            ✉️
          </div>
          <h1
            style={{
              color: "white",
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Verify Your Email
          </h1>
          <p
            style={{
              color: "#a1a1aa",
              fontSize: "1rem",
              lineHeight: "1.6",
              marginBottom: "0.5rem",
            }}
          >
            We've sent a verification link to:
          </p>
          <p
            style={{
              color: "#3b82f6",
              fontSize: "1rem",
              fontWeight: "500",
              marginBottom: "1.5rem",
              wordBreak: "break-all",
            }}
          >
            {user.email}
          </p>
          <p
            style={{
              color: "#71717a",
              fontSize: "0.9rem",
              marginBottom: "2rem",
            }}
          >
            Click the link in the email to verify your account and access ConnectU.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={handleRefresh}
              style={{
                width: "100%",
                padding: "0.875rem 1.5rem",
                background: "white",
                color: "black",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              I've Verified My Email
            </button>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              style={{
                width: "100%",
                padding: "0.875rem 1.5rem",
                background: "transparent",
                color: "#a1a1aa",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                cursor: resending ? "not-allowed" : "pointer",
                opacity: resending ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>

          <p
            style={{
              color: "#52525b",
              fontSize: "0.8rem",
              marginTop: "1.5rem",
            }}
          >
            Didn't receive the email? Check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  // Allow browsing without profile completion
  // Individual features will check profile completion and redirect if needed
  return children;
};

export default PrivateRoute;
