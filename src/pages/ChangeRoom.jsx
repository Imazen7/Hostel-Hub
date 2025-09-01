import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import UserData from "../components/UserData";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "../styles/ChangeRoom.css";

const ChangeRoom = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ currentRoom: "", desiredRoom: "", reason: "" });
  const [error, setError] = useState("");
  const [isRoomFull, setIsRoomFull] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "profiles", user.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !profile) return;
    const resetIfDue = async () => {
      if ((profile.changeStatus === "Rejected" || profile.changeStatus === "Changed") && profile.changeTime) {
        const elapsed = Date.now() - profile.changeTime;
        if (elapsed > 30 * 60 * 1000) { 
          await updateDoc(doc(db, "profiles", user.uid), {
            changeStatus: "",
            changeTime: null,
          });
        }
      }
    };
    resetIfDue();
  }, [user, profile]);

  useEffect(() => {
    if (!form.desiredRoom) {
      setIsRoomFull(false);
      return;
    }

    const checkRoomAvailability = async () => {
      const roomQuery = query(collection(db, "profiles"), where("room", "==", form.desiredRoom));
      const roomSnap = await getDocs(roomQuery);
      const full = roomSnap.docs.some(doc => doc.data().bookingStatus === "Booked");
      setIsRoomFull(full);
    };

    checkRoomAvailability();
  }, [form.desiredRoom]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      alert("Please login first.");
      return;
    }
    if (!profile || !profile.room) {
      alert("You must have a booked room before requesting a change.");
      return;
    }

    if (!form.desiredRoom || !form.reason.trim()) {
      setError("Please fill all fields.");
      return;
    }

    if (form.desiredRoom === profile.room) {
      setError("Desired room cannot be same as current room.");
      return;
    }

    if (isRoomFull) {
      setError(`Room ${form.desiredRoom} is already full. Please choose another room.`);
      return;
    }

    await setDoc(doc(db, "roomChangeRequests", user.uid), {
      userId: user.uid,
      currentRoom: profile.room,
      desiredRoom: form.desiredRoom,
      reason: form.reason,
      status: "Pending",
      createdAt: Date.now(),
    });

    await updateDoc(doc(db, "profiles", user.uid), {
      changeStatus: "Pending",
    });

    alert("Change room request sent!");
    setForm({ currentRoom: "", desiredRoom: "", reason: "" });
  };

  if (!profile) return <div>Loading...</div>;

  const isPending = profile.changeStatus === "Pending";
  const isRejected = profile.changeStatus === "Rejected";
  const isChanged = profile.changeStatus === "Changed";

  return (
    <>
      <Navbar />
      <UserData />
      <div id="change-room-container">
        <h2 id="change-room-h2">Change Room Form</h2>

        {isPending && <p>Status: Pending</p>}
        {isRejected && <p>Status: Rejected — You can retry after 30 mins</p>}
        {isChanged && <p>Status: Changed — Your room was updated.</p>}

        {!isPending && !isRejected && !isChanged && (
          <div id="change-room-form">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <label>Current Room Number:</label> <br />
              <input type="text" value={profile.room} disabled /> <br />

              <label>Desired Room Number:</label> <br />
              <input
                type="text"
                value={form.desiredRoom}
                onChange={(e) => setForm({ ...form, desiredRoom: e.target.value })}
                required
              /> <br />
              {isRoomFull && <p style={{ color: "red" }}>This room is full. Please choose another room.</p>}

              <label>Reason for Change:</label> <br />
              <textarea
                id="text-area-1"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              ></textarea> <br />

              <input
                style={{ width: "160px" }}
                type="submit"
                value="Send Request"
                disabled={isRoomFull} 
              />
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default ChangeRoom;
