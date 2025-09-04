import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase'; 
import '../styles/Signup.css'; 

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/"); 
    } catch (error) {
      alert("Sign Up failed: " + error.message);
    }
  };

  return (
    <>
      <header id='signup-header'>
        <h1 id='signup-h1'>Hostel Hub</h1>
      </header>

      <div id="signup-container">
        <div id="signup-form">
          <h2 id='signup-h2'>Sign Up</h2>
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

            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div style={{ display: 'flex', gap: '1px', padding: '10px'}}>
              <input id='submit' type="submit" value='Sign Up'/>
              <button><Link id='back-to-login' to='/'>Login</Link></button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default SignUp;
