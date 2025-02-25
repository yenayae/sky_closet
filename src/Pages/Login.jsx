import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

import "../Styles/page_css/loginPage.css";

export default function Login() {
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isDesktop, setIsDesktop] = useState(
    window.matchMedia("(min-width: 800px)").matches
  );

  useEffect(() => {
    window
      .matchMedia("(min-width: 800px)")
      .addEventListener("change", (e) => setIsDesktop(e.matches));
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setEmailError("");
    setPasswordError("");
    setError("");

    if (emailOrUsername.trim() === "") {
      setEmailError("Email or username is required");
    }

    if (password.trim() === "") {
      setError("Password is required");
    }

    if (emailError || passwordError || error) {
      setIsLoggingIn(false);
      return;
    }

    let loginEmail = emailOrUsername.trim(); // This input field will accept email or username

    if (!loginEmail.includes("@")) {
      // If input isn't an email, assume it's a username and fetch the corresponding email from profiles table
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("username", loginEmail)
        .single();

      if (error || !data) {
        setEmailError("Invalid username or email");
        setIsLoggingIn(false);
        return;
      }

      loginEmail = data.email; // Set the email for login
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setIsLoggingIn(false);
      return;
    }

    console.log("logged in!");
    setIsLoggingIn(false);
    navigate("/blog");
  };

  return (
    <div>
      <div className="login-container">
        <div
          className="login-box"
          style={{
            width: isDesktop ? "750px" : "440px",
          }}
        >
          <form className="login-section" onSubmit={handleLogin}>
            <div className="login-header">
              <h2 className="login-title">Log In</h2>
            </div>
            <div className="login-input-container">
              {/* <span>Email or Username *</span> */}
              <label
                className={`input-label ${(emailError || error) && "error"} `}
                htmlFor="email"
              >
                Email or Username
                {(emailError || error) && (
                  <span className="error">
                    <em> - {emailError || error}</em>
                  </span>
                )}
              </label>
              <input
                className="login-input"
                type="email"
                id="email"
                placeholder="Email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>

            <div className="login-input-container">
              <label
                className={`input-label ${error && "error"} `}
                htmlFor="password"
              >
                Password
                {error && (
                  <span className="error">
                    <em> - {error}</em>
                  </span>
                )}
              </label>
              <input
                className="login-input"
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="input-prompt">
                <Link to="passwordReset">Forgot password?</Link>
              </span>
            </div>
            <div className="login-input-container">
              <button
                className={`login-button ${isLoggingIn && "loading"}`}
                type="submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "logging in..." : "Log In"}
              </button>
              <span className="input-prompt">
                New User? <Link to={"/signup"}>Sign Up</Link>
              </span>
            </div>
          </form>
          {isDesktop && (
            <div className="login-right-display">
              <img
                className="tutorial-image"
                src={`/img/assets/tutorial/tutorial-2.png`}
                alt="tutorial image"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
