import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import AdminNavBar from "../../components/AdminNavBar";
import "../../styles/BookStatus.css";

const BookStatus = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "roomRequests"), async (snap) => {
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
    try {
      const pSnap = await getDoc(doc(db, "profiles", req.userId));
      if (!pSnap.exists()) {
        alert("No profile data found for this student.");
        return;
      }
      const p = pSnap.data();
      alert(
        `Student Details:
Name: ${p.name || "-"}
Email: ${p.email || "-"}
Phone: ${p.phone || "-"}
USN: ${p.usn || "-"}
Course: ${p.course || "-"}
DOB: ${p.dob || "-"}
Nationality: ${p.nationality || "-"}
Requested Room: ${req.room}`
      );
    } catch (err) {
      console.error(err);
      alert("Error fetching profile: " + err.message);
    }
  };

  const handleAccept = async (req) => {
    try {
      const profileRef = doc(db, "profiles", req.userId);
      const pSnap = await getDoc(profileRef);
      if (!pSnap.exists()) {
        alert("Profile not found for this student.");
        return;
      }

      const roomId = req.room;
      const roomRef = doc(db, "rooms", roomId);

      await runTransaction(db, async (tx) => {
        const rSnap = await tx.get(roomRef);
        const base = rSnap.exists()
          ? rSnap.data()
          : { capacity: 2, bookedCount: 0, occupants: [] };

        const cap = base.capacity ?? 2;
        const current = base.bookedCount ?? 0;
        if (current >= cap) {
          throw new Error("Room is already full.");
        }

        const newCount = current + 1;

        tx.set(
          roomRef,
          {
            capacity: cap,
            bookedCount: newCount,
            occupants: Array.from(new Set([...(base.occupants || []), req.userId])),
            isFull: newCount >= cap,
            updatedAt: Date.now(),
          },
          { merge: true }
        );

        tx.set(
          profileRef,
          { room: roomId, bookingStatus: "Booked", bookingUpdatedAt: Date.now() },
          { merge: true }
        );

        tx.delete(doc(db, "roomRequests", req.userId));
      });

      alert(`Room ${req.room} booked successfully for ${pSnap.data().name || "student"}.`);
    } catch (err) {
      console.error("Accept error:", err);
      alert("Error accepting request: " + err.message);
    }
  };

  const handleReject = async (req) => {
    try {
      const profileRef = doc(db, "profiles", req.userId);
      await updateDoc(profileRef, {
        bookingStatus: "Rejected",
        rejectionTime: Date.now(),
      });

      await deleteDoc(doc(db, "roomRequests", req.userId));

      alert("Booking request rejected.");
    } catch (err) {
      console.error("Reject error:", err);
      alert("Error rejecting request: " + err.message);
    }
  };

  const filtered = requests.filter((r) => {
    return (
      (r.room || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.name || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <AdminNavBar />
      <div className="book-status-container">
        <h1 className="page-title">Book Room Requests</h1>

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
                <h3>{req.name || "Unknown"} → {req.room}</h3>
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

        {filtered.length === 0 && (
          <p style={{ textAlign: "center" }}>No pending requests</p>
        )}
      </div>
    </>
  );
};

export default BookStatus;
