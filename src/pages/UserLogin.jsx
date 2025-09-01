import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/UserLogin.css";

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 10 * 60 * 1000; 

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const lockData = JSON.parse(localStorage.getItem("loginLock")) || null;
    if (lockData && lockData.lockedAt) {
      const elapsed = Date.now() - lockData.lockedAt;
      if (elapsed < LOCK_TIME) {
        setIsLocked(true);
        setRemainingTime(LOCK_TIME - elapsed);
      } else {
        localStorage.removeItem("loginLock");
      }
    }
  }, []);

  useEffect(() => {
    let timer;
    if (isLocked && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1000) {
            setIsLocked(false);
            localStorage.removeItem("loginLock");
            clearInterval(timer);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, remainingTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      alert(
        `Too many failed attempts. Try again in ${Math.ceil(
          remainingTime / 1000
        )} seconds.`
      );
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem("loginAttempts"); 
      navigate("/UserHome");
    } catch (error) {
      alert("Login failed. Please try again.");

      let attempts = parseInt(localStorage.getItem("loginAttempts") || "0") + 1;
      localStorage.setItem("loginAttempts", attempts);

      if (attempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setRemainingTime(LOCK_TIME);
        localStorage.setItem(
          "loginLock",
          JSON.stringify({ lockedAt: Date.now() })
        );
        alert("Too many failed attempts. All logins blocked for 10 minutes.");
      }
    }
  };

  return (
    <>
      <header id="user-login-header">
        <h1 id="user-login-h1">Hostel Hub</h1>
      </header>
      <div id="login-container">
        <div id="login-form">
          <h2 id="user-login-h2">User Login</h2>
          <form onSubmit={handleSubmit}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLocked}
            />
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLocked}
            />
            <Link id="reset-password-link" to="/Password">
              Reset Password
            </Link>
            <input
              id="submit"
              type="submit"
              value="Login"
              disabled={isLocked}
            />
          </form>
          {isLocked && (
            <p style={{ color: "red", marginTop: "10px" }}>
              Login blocked. Try again in {Math.ceil(remainingTime / 1000)} seconds.
            </p>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <Link id="AdminLogin" to="/AdminLogin">
              Admin
            </Link>
            <Link id="SignUp" to="/sign-up">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserLogin;
