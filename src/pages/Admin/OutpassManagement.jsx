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
import "../../styles/OutpassManagement.css";

const OutpassManagement = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "outpasses"), (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleShowDetails = async (req) => {
    const pSnap = await getDoc(doc(db, "profiles", req.userId));
    const profile = pSnap.exists() ? pSnap.data() : {};
    alert(`Outpass Details:
Name: ${req.name}
Room: ${req.room}
Phone: ${profile.phone || req.phone || "-"}
Start Date: ${req.startDate}
End Date: ${req.endDate}
Reason: ${req.reason}`);
  };

  const handleActivate = async (req) => {
    await updateDoc(doc(db, "outpasses", req.userId), {
      status: "Activated",
      activatedAt: Date.now(),
    });
  };

  const handleDeactivate = async (req) => {
    await updateDoc(doc(db, "outpasses", req.userId), {
      status: "Returned",
      returnedAt: Date.now(),
    });

    setTimeout(async () => {
      await deleteDoc(doc(db, "outpasses", req.userId));
    }, 10 * 60 * 1000);
  };

  const filtered = requests.filter((r) =>
    (r.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminNavBar />
      <div className="outpass-container">
        <h1 className="page-title">Outpass Management</h1>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
          placeholder="Search by name..."
        />

        <ul className="student-list">
          {filtered.map((req) => (
            <li key={req.id} className="student-card">
              <div>
                <h3>{req.name}</h3>
                <p>Room: {req.room}</p>
                <p>Status: {req.status}</p>
              </div>

              <div className="action-section">
                <button
                  className="btn show"
                  onClick={() => handleShowDetails(req)}
                >
                  Show Details
                </button>

                <button
                  className="btn leave-otp"
                  onClick={() => handleActivate(req)}
                  disabled={req.status === "Activated"}
                >
                  Activate
                </button>

                <button
                  className="btn return-otp"
                  onClick={() => handleDeactivate(req)}
                  disabled={req.status === "Returned"}
                >
                  Deactivate
                </button>
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center" }}>No outpass requests</p>
        )}
      </div>
    </>
  );
};

export default OutpassManagement;
