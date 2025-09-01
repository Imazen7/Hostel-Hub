import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import UserData from "../components/UserData";
import { auth, db } from "../firebase";
import { doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import "../styles/Outpass.css";

const Outpass = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [profile, setProfile] = useState(null);
  const [outpass, setOutpass] = useState(null);
  const [error, setError] = useState("");
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
    const unsub = onSnapshot(doc(db, "outpasses", user.uid), (snap) => {
      if (snap.exists()) {
        setOutpass(snap.data());
      } else {
        setOutpass(null);
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!outpass || !user) return;

    let timer;
    if (outpass.status === "Returned" && outpass.returnedAt) {
      timer = setTimeout(async () => {
        await deleteDoc(doc(db, "outpasses", user.uid));
        setOutpass(null);
        setStartDate("");
        setEndDate("");
        setReason("");
      }, 10 * 60 * 1000); 
    }

    return () => clearTimeout(timer);
  }, [outpass, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!profile || profile.bookingStatus !== "Booked" || !profile.room) {
      alert("You must have a booked room to request an outpass.");
      return;
    }

    if (!startDate || !endDate || !reason.trim()) {
      setError("Please fill all fields!");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      setError("Start date cannot be in the past.");
      return;
    }

    if (end < today) {
      setError("End date cannot be in the past.");
      return;
    }

    if (end < start) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    await setDoc(doc(db, "outpasses", user.uid), {
      userId: user.uid,
      name: profile.name,
      room: profile.room,
      phone: profile.phone,
      startDate,
      endDate,
      reason,
      status: "Pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setStartDate("");
    setEndDate("");
    setReason("");
    alert("Outpass request submitted!");
  };

  return (
    <>
      <Navbar />
      <UserData />
      <div id="outpass-container">
        <h2 id="outpass-h2">Outpass Form</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {outpass ? (
          <div id="outpass-form-container">
            <p>
              Status:{" "}
              <span
                style={{
                  color:
                    outpass.status === "Activated"
                      ? "green"
                      : outpass.status === "Returned"
                      ? "orange"
                      : outpass.status === "Rejected"
                      ? "red"
                      : "gray",
                }}
              >
                {outpass.status}
              </span>
            </p>
            <p>Start: {outpass.startDate}</p>
            <p>End: {outpass.endDate}</p>
            <p>Reason: {outpass.reason}</p>
          </div>
        ) : (
          <div id="outpass-form-container">
            <form onSubmit={handleSubmit}>
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <label>Reason:</label>
              <textarea
                id="outpass-textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <button className="outpass-btn" type="submit">
                Submit
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Outpass;
