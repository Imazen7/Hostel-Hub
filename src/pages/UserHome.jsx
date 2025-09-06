import React from "react";
import Navbar from "../components/Navbar";
import "../styles/UserHome.css";

const features = [
  {
    title: "Room Booking",
    desc: "Students can easily book available hostel rooms through the system with just a few clicks.",
  },
  {
    title: "Vacate Requests",
    desc: "Submit requests to vacate rooms and allow administrators to review and approve them efficiently.",
  },
  {
    title: "Outpass Requests",
    desc: "Students can apply for outpass approvals, helping admins manage hostel security and student movement.",
  },
  {
    title: "Complaints",
    desc: "Register complaints directly on the platform for hostel staff to address promptly.",
  },
  {
    title: "Profile Management",
    desc: "Update personal details, view booking history, and manage your hostel-related information.",
  },
  {
    title: "Admin Panel",
    desc: "Admins can manage student bookings, complaints, outpasses, and vacate requests seamlessly.",
  },
];

const UserHome = () => {
  return (
    <>
      <Navbar />
      <div className="home-container">
        <h1 className="home-title">Welcome to Hostel Hub</h1>
        <p className="home-subtitle">
          A complete platform for managing hostel bookings, vacate requests,
          outpasses, complaints, and student profiles.
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <h2 className="feature-title">{feature.title}</h2>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UserHome;
