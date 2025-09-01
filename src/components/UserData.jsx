import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import "../styles/Userdata.css";

const UserData = () => {
  const [authUser, setAuthUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }
    const ref = doc(db, "profiles", authUser.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setData(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => setLoading(false) 
    );
    return () => unsub();
  }, [authUser]);

  if (loading) return <div className="loading">Loading user data...</div>;
  if (!authUser) return <div className="no-data">Please log in.</div>;
  if (!data) return <div className="no-data">No user data found. Please complete your profile.</div>;

  const lastUpdated =
    data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "-";

  const bookingDisplay = data.room
    ? data.room
    : data.bookingStatus
    ? data.bookingStatus
    : "No request sent";

  return (
    <div className="user-data-container">
      <h1 className="user-data-h1">User Data</h1>
      <div className="user-details">
        <p><strong>Name:</strong> {data.name || "Not provided"}</p>
        <p><strong>Email:</strong> {authUser.email}</p>
        <p><strong>Phone Number:</strong> {data.phone || "Not provided"}</p>
        <p><strong>Course:</strong> {data.course || "Not provided"}</p>
        <p><strong>USN:</strong> {data.usn || "Not provided"}</p>
        <p><strong>Room / Status:</strong> {bookingDisplay}</p>
        <p><strong>Last Updated:</strong> {lastUpdated}</p>
      </div>
    </div>
  );
};

export default UserData;
