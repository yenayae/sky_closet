import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import DOMPurify from "dompurify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const [error, setError] = useState("");

  const sanitizeInput = (input) => DOMPurify.sanitize(input);

  const [isDesktop, setIsDesktop] = useState(
    window.matchMedia("(min-width: 800px)").matches
  );

  useEffect(() => {
    window
      .matchMedia("(min-width: 800px)")
      .addEventListener("change", (e) => setIsDesktop(e.matches));
  }, []);

  const handleSignup = async (event) => {
    event.preventDefault();

    //validate inputs first
    setEmail(sanitizeInput(email));
    setUsername(sanitizeInput(username));
    setPassword(sanitizeInput(password));

    const isEmailValid = validateEmail(email);
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isUsernameValid || !isPasswordValid) {
      setError("Invalid inputs");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      // Store the username in the profiles table
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id, // Link to auth.users
          username,
          email,
        },
      ]);

      if (profileError) {
        setError(profileError.message);
        console.log(profileError.message);
        return;
      }
    }

    console.log("successfully signe dup?");
    navigate("/login");
  };

  //   validation functions
  const validateEmail = (email) => {
    if (email.trim() === "") {
      setEmailError("Required");
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(email)) {
      setEmailError("Invalid email");
      return false;
    }

    setEmailError("");
    return true;
  };

  const validatePassword = (password) => {
    if (password.trim() === "") {
      setPasswordError("Required");
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      setPasswordError("Invalid password");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const validateUsername = (username) => {
    if (username.trim() === "") {
      setUsernameError("Required");
      return false;
    }

    if (username.length < 3 || username.length > 20) {
      setUsernameError("Must be between 3 to 20 characters");
      return false;
    }

    setUsernameError("");
    return true;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePasswordOnChange(newPassword);
  };

  const validatePasswordOnChange = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    };

    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  return (
    <div>
      <div className="login-container">
        <div
          className="login-box"
          style={{
            width: isDesktop ? "750px" : "440px",
          }}
        >
          <form className="login-section" onSubmit={handleSignup}>
            <div className="login-header">
              <h2 className="login-title">Create an account</h2>
            </div>
            <div className="login-input-container">
              {/* <span>Email or Username *</span> */}
              <label className="input-label" htmlFor="email">
                Email
                {emailError && (
                  <span className="error">
                    <em> - {emailError}</em>
                  </span>
                )}
              </label>
              <input
                className="login-input"
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-input-container">
              {/* <span>Email or Username *</span> */}
              <label className="input-label" htmlFor="email">
                Username
                {usernameError && (
                  <span className="error">
                    <em> - {usernameError}</em>
                  </span>
                )}
              </label>
              <input
                className="login-input"
                type="username"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="login-input-container">
              <label className="input-label" htmlFor="password">
                Password
                {passwordError && (
                  <span className="error">
                    <em> - {passwordError}</em>
                  </span>
                )}
              </label>
              <input
                className="login-input"
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />

              {passwordError && (
                <div
                  className={`password-error ${
                    isPasswordValid ? "success" : "error"
                  }`}
                >
                  <span>Password must contain:</span>
                  <ul className="password-requirements">
                    <li>
                      <FontAwesomeIcon
                        icon={passwordRequirements.length ? faCheck : faXmark}
                      />{" "}
                      At least 8 characters
                    </li>
                    <li>
                      {" "}
                      <FontAwesomeIcon
                        icon={
                          passwordRequirements.uppercase ? faCheck : faXmark
                        }
                      />{" "}
                      At least one uppercase letter
                    </li>
                    <li>
                      {" "}
                      <FontAwesomeIcon
                        icon={
                          passwordRequirements.lowercase ? faCheck : faXmark
                        }
                      />{" "}
                      At least one lowercase letter
                    </li>
                    <li>
                      {" "}
                      <FontAwesomeIcon
                        icon={passwordRequirements.number ? faCheck : faXmark}
                      />{" "}
                      At least one number
                    </li>
                    <li>
                      {" "}
                      <FontAwesomeIcon
                        icon={
                          passwordRequirements.specialChar ? faCheck : faXmark
                        }
                      />{" "}
                      At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="login-input-container">
              <button className="login-button" type="submit">
                Sign Up
              </button>
              <span className="input-prompt">
                Already have an account? <Link to={"/login"}>Log in</Link>
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
