import React from "react";
import "./style.css";
import { auth } from "./firebase";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { dataBase } from "./firebase";
import logo from "./assets/connect.webp";
import toast from "react-hot-toast";

function Access() {
  const [option, setOption] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedPolicy, setAcceptedpolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  function wantLogin() {
    setOption(true);
    setError("");
  }

  function wantSignUp() {
    setOption(false);
    setError("");
  }

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectUser = async () => {
      if (loading) return;

      if (user) {
        const userRef = doc(dataBase, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists() && snap.data().profileCompleted) {
          navigate("/app/events", { replace: true });
        } else {
          // Allow browsing without completed profile
          navigate("/app/events", { replace: true });
        }
      }
    };

    redirectUser();
  }, [user, loading, navigate]);

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      navigate("/app/events", { replace: true });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send email verification
      await sendEmailVerification(userCredential.user);
      toast.success('Account created! Please check your email to verify your account.');
      // Redirect to app so users can browse immediately
      navigate("/app/events", { replace: true });
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError("Sign up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!isValidEmail(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setResetLoading(true);
    try {
      // Check if email is registered in Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, resetEmail);

      if (signInMethods.length === 0) {
        // No sign-in methods means the email is not registered
        toast.error("No account found with this email");
        setResetLoading(false);
        return;
      }

      // Email exists in Firebase Auth, proceed to send reset link
      await sendPasswordResetEmail(auth, resetEmail);
      setShowForgotPassword(false);
      setShowResetSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please try again later.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email format");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  }

  function goToPolicy(e) {
    e.preventDefault();
    navigate("/policy");
  }

  if (loading) {
    return (
      <div className="container-main">
        <div className="container" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "1rem", color: "#6b7280" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main">
      <div className="container" style={{ overflow: "visible", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <img
            src={logo}
            alt="ConnectU Logo"
            style={{ height: "50px", marginBottom: "0.5rem" }}
          />
        </div>
        <h2>Welcome to ConnectU</h2>
        <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Find your perfect team for college events
        </p>

        <div className="choosing--buttons">
          <button
            className={`option ${option ? "choosen" : ""}`}
            onClick={wantLogin}
          >
            Login
          </button>
          <button
            className={`signUp ${option ? "" : "choosen"}`}
            onClick={wantSignUp}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            color: "#dc2626",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {option && (
          <form id="login-form" className="login1" onSubmit={handleLogin} autoComplete="off">
            <div className="email block">
              <input
                type="email"
                name="login-email"
                placeholder="Enter your email"
                id="email-input1"
                className="inp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
            <div className="password block">
              <input
                type="password"
                name="login-password"
                placeholder="Enter your password"
                id="password-input1"
                className="inp"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
            <div className="login-btn block">
              <input
                type="submit"
                value={isLoading ? "Logging in..." : "Login"}
                id="login-submit"
                className="inp"
                disabled={!acceptedPolicy || isLoading}
              />
            </div>
          </form>
        )}

        {option && (
          <h5 className="new-user">
            <a
              className="a-tag"
              onClick={() => setShowForgotPassword(true)}
              style={{ cursor: 'pointer' }}
            >
              Forgot Password?
            </a>
          </h5>
        )}

        {option && (
          <h5 className="new-user">
            New to ConnectU?{" "}
            <a className="a-tag" onClick={wantSignUp}>
              Create an account
            </a>
          </h5>
        )}

        {option && (
          <div className="footer-login">
            <input
              type="checkbox"
              name="policy-checkbox1"
              id="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedpolicy(e.target.checked)}
            />
            <p className="block div-1">
              I agree to the{" "}
              <span
                className="terms-link"
                onClick={goToPolicy}
              >
                Terms & Conditions
              </span>
            </p>
          </div>
        )}

        {!option && (
          <form id="signup-form" className="signup1" onSubmit={handleSignUp}>
            <div className="email block">
              <input
                type="email"
                name="Email"
                placeholder="Enter your email"
                id="email-input2"
                className="inp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="password block">
              <input
                type="password"
                name="Password"
                placeholder="Create a password"
                id="password-input2"
                className="inp"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="confirm-password block">
              <input
                type="password"
                name="confirm-password"
                placeholder="Confirm your password"
                id="confirm-password"
                className="inp"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="signup-btn block">
              <input
                type="submit"
                value={isLoading ? "Creating account..." : "Create Account"}
                id="signup-submit"
                disabled={!acceptedPolicy || isLoading}
              />
            </div>
          </form>
        )}

        {!option && (
          <h5 className="new-user">
            Already have an account?{" "}
            <a className="a-tag" onClick={wantLogin}>
              Login here
            </a>
          </h5>
        )}

        {!option && (
          <div className="footer-signup">
            <input
              type="checkbox"
              name="policy-checkbox2"
              id="signup-policy-checkup"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedpolicy(e.target.checked)}
            />
            <p className="block div-2">
              I agree to the{" "}
              <span
                className="terms-link"
                onClick={goToPolicy}
              >
                Terms & Conditions
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            padding: '2rem',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '400px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{
              color: '#fff',
              marginBottom: '0.5rem',
              fontSize: '1.25rem'
            }}>
              Reset Password
            </h3>
            <p style={{
              color: '#9ca3af',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: '#fff',
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    opacity: resetLoading ? 0.7 : 1
                  }}
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Success Modal */}
      {showResetSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            padding: '2rem',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '400px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            {/* Success Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h3 style={{
              color: '#fff',
              marginBottom: '0.75rem',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Email Sent!
            </h3>

            <p style={{
              color: '#d1d5db',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              We've sent a password reset link to <strong style={{ color: '#fff' }}>{resetEmail}</strong>
            </p>

            {/* Spam Folder Warning */}
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginTop: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              textAlign: 'left'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p style={{
                  color: '#fbbf24',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem'
                }}>
                  Can't find the email?
                </p>
                <p style={{
                  color: '#d1d5db',
                  fontSize: '0.8rem',
                  lineHeight: '1.4'
                }}>
                  Please check your <strong style={{ color: '#fbbf24' }}>spam</strong> or <strong style={{ color: '#fbbf24' }}>junk</strong> folder. Sometimes the email might end up there.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowResetSuccess(false);
                setResetEmail('');
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Access;
