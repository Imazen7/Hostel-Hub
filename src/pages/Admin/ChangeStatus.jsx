import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import AdminNavBar from "../../components/AdminNavBar";
import "../../styles/ChangeStatus.css";

const ChangeStatus = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "roomChangeRequests"), async (snap) => {
      const list = await Promise.all(
        snap.docs.map(async (d) => {
          const req = { id: d.id, ...d.data() };
          try {
            const pSnap = await getDoc(doc(db, "profiles", req.userId));
            return { ...req, name: pSnap.exists() ? pSnap.data().name : "" };
          } catch {
            return { ...req, name: "" };
          }
        })
      );
      setRequests(list);
    });
    return () => unsub();
  }, []);

  const handleShowDetails = async (req) => {
    const pSnap = await getDoc(doc(db, "profiles", req.userId));
    if (!pSnap.exists()) {
      alert("Profile not found.");
      return;
    }
    const p = pSnap.data();
    alert(`Student Details:
Name: ${p.name}
Email: ${p.email}
Phone: ${p.phone}
USN: ${p.usn}
Course: ${p.course}
DOB: ${p.dob}
Nationality: ${p.nationality}
Current Room: ${req.currentRoom}
Desired Room: ${req.desiredRoom}
Reason: ${req.reason}`);
  };

  const handleAccept = async (req) => {
    try {
      await runTransaction(db, async (tx) => {
        const profileRef = doc(db, "profiles", req.userId);
        const pSnap = await tx.get(profileRef);
        if (!pSnap.exists()) throw new Error("Profile not found");

        tx.update(profileRef, {
          room: req.desiredRoom,
          changeStatus: "Changed",
          changeTime: Date.now(),
        });

        tx.delete(doc(db, "roomChangeRequests", req.userId));
      });

      alert("Change request accepted and updated.");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleReject = async (req) => {
    try {
      const profileRef = doc(db, "profiles", req.userId);
      await updateDoc(profileRef, {
        changeStatus: "Rejected",
        changeTime: Date.now(),
      });

      await deleteDoc(doc(db, "roomChangeRequests", req.userId));
      alert("Change request rejected.");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filtered = requests.filter((r) => {
    return (
      (r.desiredRoom || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.name || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <AdminNavBar />
      <div className="change-status-container">
        <h1 className="page-title">Room Change Requests</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
          placeholder="Search by name..."
        />

        <ul className="request-list">
          {filtered.map((req) => (
            <li key={req.id} className="request-card">
              <div>
                <h3>{req.name || "Unknown"} → {req.desiredRoom}</h3>
                <p>Status: {req.status || "Pending"}</p>
              </div>
              <div className="action-buttons">
                <button className="btn show" onClick={() => handleShowDetails(req)}>
                  Show Details
                </button>
                <button className="btn accept" onClick={() => handleAccept(req)}>
                  Accept
                </button>
                <button className="btn reject" onClick={() => handleReject(req)}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && <p style={{ textAlign: "center" }}>No change requests</p>}
      </div>
    </>
  );
};

export default ChangeStatus;
