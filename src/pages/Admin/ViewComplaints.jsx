import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import AdminNavBar from "../../components/AdminNavBar";
import "../../styles/ViewComplaints.css";

const ViewComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "complaints"), (snap) => {
      setComplaints(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleShowDetails = async (c) => {
    const pSnap = await getDoc(doc(db, "profiles", c.userId));
    const profile = pSnap.exists() ? pSnap.data() : {};
    alert(`Complaint Details:
Name: ${c.name}
Room: ${c.room}
Phone: ${profile.phone || c.phone || "-"}
Type: ${c.type}
Description: ${c.description}`);
  };

  const handleToggleStatus = async (c) => {
    if (c.status === "Pending") {
      await updateDoc(doc(db, "complaints", c.userId), {
        status: "Resolved",
        resolvedAt: Date.now(),
      });

      setTimeout(async () => {
        await deleteDoc(doc(db, "complaints", c.userId));
      }, 5 * 60 * 1000); // delete after 5 mins
    }
  };

  const filtered = complaints.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminNavBar />
      <div className="complaints-container">
        <h1 className="page-title">View Complaints</h1>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
          placeholder="Search by name..."
        />

        <ul className="complaints-list">
          {filtered.map((c) => (
            <li key={c.id} className="complaint-card">
              <div>
                <h3>{c.name}</h3>
                <p>{c.type}</p>
              </div>

              <div className="action-buttons">
                <button className="btn show" onClick={() => handleShowDetails(c)}>
                  Show Details
                </button>
                <button
                  className={`btn status-btn ${
                    c.status === "Resolved" ? "status-fixed" : "status-pending"
                  }`}
                  onClick={() => handleToggleStatus(c)}
                >
                  {c.status}
                </button>
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center" }}>No complaints</p>
        )}
      </div>
    </>
  );
};

export default ViewComplaints;
