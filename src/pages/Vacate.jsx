import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UserData from '../components/UserData';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import '../styles/Vacate.css';

const Vacate = () => {
  const [reason, setReason] = useState("");
  const [request, setRequest] = useState(null);
  const [profile, setProfile] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "profiles", user.uid), (snap) => {
      if (snap.exists()) setProfile(snap.data());
      else setProfile(null);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "vacateRequests", user.uid), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const now = Date.now();
        const expiry = data.acceptedAt ? data.acceptedAt + 24 * 60 * 60 * 1000 : null;

        if (data.status === "Accepted" && expiry && now > expiry) {
          await deleteDoc(doc(db, "vacateRequests", user.uid));
          setRequest(null);
        } 
        else if (data.status === "Accepted" && profile?.bookingStatus === "Booked") {
          await deleteDoc(doc(db, "vacateRequests", user.uid));
          setRequest(null);
        } 
        else {
          setRequest(data);
        }
      } else {
        setRequest(null);
      }
    });
    return () => unsub();
  }, [user, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!profile || profile.bookingStatus !== "Booked" || !profile.room) {
      alert("You must have a booked room before submitting a vacate request.");
      return;
    }

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      alert("Reason cannot be empty.");
      return;
    }
    if (trimmedReason.length < 10) {
      alert("Please provide a more detailed reason (at least 10 characters).");
      return;
    }

    await setDoc(doc(db, "vacateRequests", user.uid), {
      userId: user.uid,
      studentName: profile.name || "",
      studentNumber: profile.usn || "",
      roomNumber: profile.room || "",
      reason: trimmedReason,
      status: "Pending",
      createdAt: Date.now(),
    });

    setReason("");
  };

  return (
    <>
      <Navbar />
      <UserData />
      <div className="vacate-container">
        <h2>Vacate Request</h2>

        {!profile?.room || profile?.bookingStatus !== "Booked" ? (
          <p className="no-room-msg">
            You don’t have a booked room. Vacate requests are only allowed if you already have a room.
          </p>
        ) : (
          <>
            {!request && (
              <form onSubmit={handleSubmit} className="vacate-form">
                <label htmlFor="reason">Reason for Vacating:</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button type="submit" className="submit-btn">
                  Submit Request
                </button>
              </form>
            )}

            {request && request.status === "Pending" && (
              <div className="status-box">
                <h3>Status: Pending</h3>
                <p><strong>Reason:</strong> {request.reason}</p>
              </div>
            )}

            {request && request.status === "Accepted" && (
              <div className="status-box success-msg">
                <h3>Room vacated successfully</h3>
                <p><strong>Reason:</strong> {request.reason}</p>
                <p>This message will disappear after 24 hours or if you book a new room.</p>
              </div>
            )}

            {request && request.status === "Rejected" && (
              <div className="status-box error-msg">
                <h3>Vacate request rejected</h3>
                <p><strong>Reason:</strong> {request.reason}</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Vacate;
