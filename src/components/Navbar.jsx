// components/Navbar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import "../styles/Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCloseMenu = () => setMenuOpen(false);

  const handleLinkClick = (path) => {
    setLoading(true);
    setTimeout(() => { 
      navigate(path);
      setLoading(false);
    }, 200);
  };

  return (
    <>
      {loading && <Spinner />}
      <nav className="navbar">
        <div className="navbar-logo">Hostel Hub</div>

        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
          <li><button onClick={() => handleLinkClick("/UserHome")}>Home</button></li>
          <li><button onClick={() => handleLinkClick("/BookRoom")}>Book</button></li>
          <li><button onClick={() => handleLinkClick("/ChangeRoom")}>Change</button></li>
          <li><button onClick={() => handleLinkClick("/Complaint")}>Complaint</button></li>
          <li><button onClick={() => handleLinkClick("/Outpass")}>Outpass</button></li>
          <li><button onClick={() => handleLinkClick("/Admins")}>Admins</button></li>
          <li><button onClick={() => handleLinkClick("/Vacate")}>Vacate</button></li>
          <li><button onClick={() => handleLinkClick("/Profile")}>Profile</button></li>
          <li><button onClick={() => handleLinkClick("/")}>Logout</button></li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
