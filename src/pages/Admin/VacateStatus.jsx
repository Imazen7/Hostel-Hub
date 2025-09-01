  import { useEffect, useState } from "react";
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
  import "../../styles/VacateStatus.css";

  const VacateStatus = () => {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
      const unsub = onSnapshot(collection(db, "vacateRequests"), async (snap) => {
        const list = await Promise.all(
          snap.docs.map(async (d) => {
            const req = { id: d.id, ...d.data() };
            try {
              const pSnap = await getDoc(doc(db, "profiles", req.userId));
              return { ...req, profile: pSnap.exists() ? pSnap.data() : {} };
            } catch {
              return { ...req, profile: {} };
            }
          })
        );
        setRequests(list);
      });
      return () => unsub();
    }, []);

    const handleAccept = async (req) => {
      try {
        if (!req.userId) return;
        const profileRef = doc(db, "profiles", req.userId);
        const pSnap = await getDoc(profileRef);
        if (!pSnap.exists()) {
          alert("Profile not found for this student.");
          return;
        }
        const profile = pSnap.data();
        const roomId = profile.room;
        if (!roomId) {
          alert("No room linked to this student.");
        }

        const roomRef = doc(db, "rooms", roomId);

        await runTransaction(db, async (tx) => {

          if (roomId) {
            const rSnap = await tx.get(roomRef);
            if (rSnap.exists()) {
              const base = rSnap.data();
              const newCount = Math.max((base.bookedCount ?? 1) - 1, 0);
              tx.update(roomRef, {
                bookedCount: newCount,
                isFull: false,
                occupants: (base.occupants || []).filter((id) => id !== req.userId),
                updatedAt: Date.now(),
              });
            }
          }

          tx.update(profileRef, {
            room: "",
            bookingStatus: "",
          });

          tx.update(doc(db, "vacateRequests", req.userId), {
            status: "accepted",
            updatedAt: Date.now(),
          });
        });

        alert("Vacate request accepted & room freed.");
      } catch (err) {
        console.error("Accept error:", err);
        alert("Error accepting vacate: " + err.message);
      }
    };

    const handleReject = async (req) => {
      try {
        await updateDoc(doc(db, "vacateRequests", req.userId), {
          status: "rejected",
          updatedAt: Date.now(),
        });
        alert("Vacate request rejected.");
      } catch (err) {
        console.error("Reject error:", err);
        alert("Error rejecting request: " + err.message);
      }
    };

    const filtered = requests.filter((r) => {
      return (
        (r.profile?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.profile?.room || "").toLowerCase().includes(search.toLowerCase())
      );
    });

    return (
      <>
        <AdminNavBar />
        <div className="change-status-container">
          <h1 className="page-title">Vacate Requests</h1>

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
                  <h3>{req.profile?.name || "Unknown Student"}</h3>
                  <p>Room: {req.profile?.room || "N/A"}</p>
                  <p>Reason: {req.reason}</p>
                  <p>
                    Status:{" "}
                    <span
                      className={`status-label ${
                        req.status === "accepted"
                          ? "status-accepted"
                          : req.status === "rejected"
                          ? "status-rejected"
                          : ""
                      }`}
                    >
                      {req.status || "Pending"}
                    </span>
                  </p>
                </div>

                {req.status === "Pending" && (
                  <div className="action-buttons">
                    <button className="btn accept" onClick={() => handleAccept(req)}>
                      Accept
                    </button>
                    <button className="btn reject" onClick={() => handleReject(req)}>
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p style={{ textAlign: "center" }}>No vacate requests found</p>
          )}
        </div>
      </>
    );
  };

  export default VacateStatus;  
