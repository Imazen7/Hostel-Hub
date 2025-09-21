// AdminLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const docRef = doc(db, "profiles", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().isAdmin === true) {
        navigate("/BookStatus"); 
      } else {
        setError("You are not authorized as an admin.");  
        await auth.signOut();
      }
    } catch (err) {
      console.error(err);
      setError("Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header id="admin-login-header">
        <h1 id="admin-login-h1">Hostel Hub</h1>
      </header>

      <div id="admin-login-container">
        <div id="admin-login-form">
          <h2 id="admin-login-h2">Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
              <Link
                id="login-page"
                to="/"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  textAlign: "center",
                  lineHeight: "50px",
                  height: "50px",
                  backgroundColor: "#00809D",
                  color: "#fff",
                  borderRadius: "6px",
                  width: "100%",
                }}
              >
                Back to User
              </Link>
            </div>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
