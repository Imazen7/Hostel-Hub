  import React, { useEffect, useMemo, useState } from "react";
  import Navbar from "../components/Navbar";
  import UserData from "../components/UserData";
  import { auth, db } from "../firebase";
  import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    collection,
    query,
    where,
  } from "firebase/firestore";
  import "../styles/BookRoom.css";

  const BookRoom = () => {
    const [selectedBlock, setSelectedBlock] = useState("A");
    const [selectedFloor, setSelectedFloor] = useState(1);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [profile, setProfile] = useState(null);
    const [roomsFull, setRoomsFull] = useState(new Set());
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
      const resetRejectedIfDue = async () => {
        if (!user || !profile) return;
        if (profile.bookingStatus === "Rejected" && profile.rejectionTime) {
          const elapsed = Date.now() - profile.rejectionTime;
          if (elapsed > 24 * 60 * 60 * 1000) {
            await updateDoc(doc(db, "profiles", user.uid), {
              bookingStatus: "",
              rejectionTime: null,
            });
          }
        }
      };
      resetRejectedIfDue();
    }, [user, profile]);

    useEffect(() => {
      const q = query(collection(db, "rooms"), where("isFull", "==", true));
      const unsub = onSnapshot(q, (snap) => {
        setRoomsFull(new Set(snap.docs.map((d) => d.id)));
      });
      return () => unsub();
    }, []);

    const floors = useMemo(() => Array.from({ length: 6 }, (_, i) => i + 1), []);
    const rooms = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);

    const handleBook = async () => {
      if (!user) {
        alert("Please login first.");
        return;
      }
      if (!profile) {
        alert("Complete your profile before booking.");
        return;
      }
      const required = ["name", "phone", "usn", "course", "dob", "nationality"];
      const missing = required.filter((k) => !profile[k]);
      if (missing.length) {
        alert("Please complete your profile before booking.");
        return;
      }
      if (!selectedRoom) {
        alert("Select a room first.");
        return;
      }

      const roomId = `${selectedBlock}-${selectedFloor}-${selectedRoom}`;
      if (roomsFull.has(roomId)) {
        alert("This room is already full. Please choose another.");
        return;
      }

      await setDoc(
        doc(db, "roomRequests", user.uid),
        {
          userId: user.uid,
          room: roomId,
          status: "Pending",
          createdAt: Date.now(),
        },
        { merge: true }
      );

      await updateDoc(doc(db, "profiles", user.uid), {
        bookingStatus: "Pending",
        room: "", 
      });

      alert("Room booking request submitted!");
    };

    const isBooked = profile?.bookingStatus === "Booked" && profile?.room;
    const isPending = profile?.bookingStatus === "Pending";
    const isRejected = profile?.bookingStatus === "Rejected";

    return (
      <>
        <Navbar />
        <UserData />
        <div className="bookroom-container">
          <h1 className="page-title">Book a Room</h1>

          {isBooked && (
            <div className="selected-info">
              <h3>Your room is booked: {profile.room}</h3>
            </div>
          )}

          {!isBooked && isPending && (
            <div className="selected-info">
              <h3>Status: Pending</h3>
            </div>
          )}

          {!isBooked && isRejected && (
            <div className="selected-info">
              <h3>Status: Rejected — you can try again after 24 hours.</h3>
            </div>
          )}

          {!isBooked && !isPending && !isRejected && (
            <>
              <div className="form-group">
                <label className="select-block">Select Block:</label>
                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                >
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                </select>
              </div>

              <div className="form-group">
                <label className="select-block">Select Floor:</label>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(Number(e.target.value))}
                >
                  {floors.map((floor) => (
                    <option key={floor} value={floor}>
                      Floor {floor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rooms-container">
                <h2 className="select-block">
                  Room in Block {selectedBlock} - Floor {selectedFloor}
                </h2>
                <div className="rooms-grid">
                  {rooms.map((room) => {
                    const roomNumber = `${selectedBlock}-${selectedFloor}-${room}`;
                    const isFull = roomsFull.has(roomNumber);
                    return (
                      <button
                        key={roomNumber}
                        className={`room-btn ${
                          selectedRoom === room ? "selected" : ""
                        } ${isFull ? "disabled" : ""}`}
                        disabled={isFull}
                        onClick={() => setSelectedRoom(room)}
                      >
                        {roomNumber} {isFull ? "(Full)" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedRoom && (
                <div className="selected-info">
                  <h3>
                    You selected:{" "}
                    {`${selectedBlock}-${selectedFloor}-${selectedRoom}`}
                  </h3>
                  <input
                    className="confirm-book"
                    type="button"
                    value="Book Room"
                    onClick={handleBook}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  };

  export default BookRoom;
