import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import AdminNavBar from "../../components/AdminNavBar";
import "../../styles/BookStatus.css"; // reuse same styling

const ConfirmedRooms = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "profiles"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.bookingStatus === "Booked" && p.room); // only booked students
      setStudents(list);
    });
    return () => unsub();
  }, []);

  const handleShowDetails = async (student) => {
    try {
      const pSnap = await getDoc(doc(db, "profiles", student.id));
      if (!pSnap.exists()) {
        alert("Profile not found.");
        return;
      }
      const p = pSnap.data();
      alert(`Student Details:
Name: ${p.name || "-"}
Email: ${p.email || "-"}
Phone: ${p.phone || "-"}
USN: ${p.usn || "-"}
Course: ${p.course || "-"}
DOB: ${p.dob || "-"}
Nationality: ${p.nationality || "-"}
Current Room: ${p.room || "N/A"}`);
    } catch (err) {
      console.error(err);
      alert("Error fetching details: " + err.message);
    }
  };

  const filtered = students.filter((s) => {
    return (
      (s.room || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.name || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <AdminNavBar />
      <div className="book-status-container">
        <h1 className="page-title">Confirmed Room Bookings</h1>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
          placeholder="Search by name or room..."
        />

        <ul className="student-list">
          {filtered.map((student) => (
            <li key={student.id} className="student-card">
              <div>
                <h3>{student.name || "Unknown"} → {student.room}</h3>
                <p>Status: {student.bookingStatus}</p>
              </div>

              <div className="action-buttons">
                <button
                  className="btn show"
                  onClick={() => handleShowDetails(student)}
                >
                  Show Details
                </button>
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center" }}>No confirmed bookings found</p>
        )}
      </div>
    </>
  );
};

export default ConfirmedRooms; 
