import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Password.css";

const Password = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        alert("This email is not registered. Please sign up first.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent! Check your email.");
    } catch (error) {
      alert(error.message);
    }
  };
  
  return (
    <>
      <header id="reset-password-header">
        <h1 id="reset-password-h1">Hostel Hub</h1>
      </header>
      <div id="password-container">
        <div id="password-form">
          <h2 id="reset-password-h2">Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <input id="submitPassword" type="submit" value="Send Reset Link" />
              <Link id="link" to="/">Back to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Password;
