import {useState} from  'react'
import { Link, useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import '../styles/AdminNavBar.css'

const AdminNavBar = () => {
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
      {/* Left - Logo */}
      <div className="navbar-logo">Hostel Hub</div>
          <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

      <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
        <li><button onClick={() => handleLinkClick("/BookStatus")}>Book Status</button></li>
        <li><button onClick={() => handleLinkClick("/ChangeStatus")}>Change Status</button></li>
        <li><button onClick={() => handleLinkClick("/VacateStatus")}>Vacate Status</button></li>
        <li><button onClick={() => handleLinkClick("/ViewComplaints")}>View Complaints</button></li>
        <li><button onClick={() => handleLinkClick("/Manageoutpass")}>Outpass Management</button></li>
        <li><button onClick={() => handleLinkClick("/ConfirmedRooms")}>Confirmed Rooms</button></li>
        <li><button onClick={() => handleLinkClick("/AdminLogin")}>Logout</button></li>
      </ul>
    </nav>
    </>
  );
};
export default AdminNavBar
