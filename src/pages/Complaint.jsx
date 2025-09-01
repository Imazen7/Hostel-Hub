import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import UserData from "../components/UserData";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import "../styles/Complaint.css";

const Complaint = () => {
  const [complaintType, setComplaintType] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [profile, setProfile] = useState(null);
  const [complaint, setComplaint] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "profiles", user.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "complaints", user.uid), (snap) => {
      if (snap.exists()) {
        setComplaint(snap.data());
      } else {
        setComplaint(null);
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (complaint?.status === "Resolved" && complaint.resolvedAt) {
      const timer = setTimeout(async () => {
        await deleteDoc(doc(db, "complaints", user.uid));
        setComplaint(null);
        setComplaintType("");
        setComplaintText("");
      }, 5 * 60 * 1000); // 5 mins
      return () => clearTimeout(timer);
    }
  }, [complaint, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!profile || profile.bookingStatus !== "Booked" || !profile.room) {
      alert("You must have a booked room to submit a complaint.");
      return;
    }

    if (!complaintType || !complaintText.trim()) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    await setDoc(doc(db, "complaints", user.uid), {
      userId: user.uid,
      name: profile.name,
      room: profile.room,
      phone: profile.phone,
      type: complaintType,
      description: complaintText,
      status: "Pending",
      createdAt: Date.now(),
    });

    setComplaintType("");
    setComplaintText("");
    alert("Your complaint has been submitted successfully!");
  };

  return (
    <>
      <Navbar />
      <UserData />

      <div id="complaint-container">
        <h2 id="complaint-h2">Complaint Form</h2>

        {complaint && (
          <p>Status: {complaint.status}</p>
        )}

        {!complaint && (
          <div id="complaint-form">
            <form onSubmit={handleSubmit}>
              <label>Type of Complaint:</label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value)}
              >
                <option value="">-- Select Complaint Type --</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Food">Food</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Internet">Internet</option>
                <option value="Other">Other</option>
              </select>

              <label>Description:</label>
              <textarea
                id="complaint-textarea"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
              />

              <br />
              <input type="submit" id="submit-btn" value="Submit Complaint" />
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Complaint;
