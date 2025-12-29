import React from "react";
import "./style.css";
import { auth } from "./firebase";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Access() {
  const [option, setOption] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [acceptedPolicy, setAcceptedpolicy] = React.useState(false);

  function wantLogin() {
    setOption(true);
  }

  function wantSignUp() {
    setOption(false);
  }

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) {
      navigate("/profile", { replace: true })
    }
  }, [user, loading, navigate])

  async function handleLogin(e) {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password)
      alert("Login Succesfull !!");
      navigate("/profile", { replace: true });
    }
    catch (error) {
      alert(error.message);
    }
  };

  async function handleSignUp(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password and confirmPassword must be same");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("SignUp Succesfully !!");
    }
    catch (error) {
      alert(error.message);
    }
  };

  function Policy(params) {
    params.preventDefault();
    navigate("/policy")

  }

  return (
    <div className="container-main">
      <div className="container">
        <h2>Secure Access</h2>
        <div className="choosing--buttons">
        <button className={`option ${option ? "choosen" : ""} `} onClick={wantLogin}>
          Login
        </button>

        <button className = {`signUp ${option ? "" : "choosen"}`} onClick={wantSignUp}>
          Sign Up
        </button>
        </div>

        {option && (
          <form id="login-form" className="login1" onSubmit={handleLogin}>
            <div className="email block">
              <input
                type="text"
                name="Email"
                placeholder="Email"
                id="email-input1"
                className="inp"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="password block">
              <input
                type="password"
                name="Password"
                placeholder="Password"
                id="password-input1"
                className="inp"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="login-btn block">
              <input
                type="submit"
                value="Login"
                id="login-submit"
                className="inp"
                disabled={!acceptedPolicy}
              />
            </div>
          </form>
        )}

        {option && (
          <h5 className="new-user">
            New user <a className="a-tag" onClick={wantSignUp}>Register Here</a>
          </h5>
        )}
        {option && (
          <div className={`${option ? "footer-login" : "footer-signup"}`}>
            <input
              type="checkbox"
              name="policy-checkbox1"
              id="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedpolicy(e.target.checked)}
            />
            <p className="block div-1">
              Agree to our{" "}
              <span className="policy">
                <a className="terms&conditions" onClick={Policy} >Terms & Conditions...</a>
              </span>
            </p>
          </div>
        )}

        {option === false && (
          <form id="signup-form" className="signup1" onSubmit={handleSignUp}>
            <div className="email block">
              <input
                type="text"
                name="Email"
                placeholder="Email"
                id="email-input2"
                className="inp"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="password block">
              <input
                type="password"
                name="Password"
                placeholder="Password"
                id="password-input2"
                className="inp"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="confirm-password block">
              <input
                type="password"
                name="confirm-password"
                placeholder="Confirm Password"
                id="confirm-password"
                className="inp"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="signup-btn block">
              <input
                type="submit"
                value="Sign Up"
                id="signup-submit"
                disabled={!acceptedPolicy}
              />
            </div>
          </form>
        )}
        {option === false && (
          <div className={`${option ? "footer-login" : "footer-signup"}`}>
            <input
              type="checkbox"
              name="policy-checkbox2"
              id="signup-policy-checkup"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedpolicy(e.target.checked)}
            />
            <p className="block div-2">
              Agree to our{" "}
              <span className="policy">
                <a className="terms&conditions" onClick={Policy}>Terms & Conditions...</a>
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Access;
