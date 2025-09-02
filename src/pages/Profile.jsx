import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "../styles/Profile.css";

const Profile = () => {
  const user = auth.currentUser;
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    usn: "",
    course: "",
    dob: "",
    nationality: "",
  });
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, "profiles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData((prev) => ({
              ...prev,
              ...data,
            }));
            setProfileExists(true);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          alert("Error loading profile: " + error.message);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return false;
    }

    const dob = new Date(formData.dob);
    if (isNaN(dob.getTime())) {
      alert("Please enter a valid Date of Birth.");
      return false;
    }

    const day = dob.getUTCDate();
    const month = dob.getUTCMonth() + 1; 
    const year = dob.getUTCFullYear();

    if (day < 1 || day > 31) {
      alert("Day must be between 01 and 31.");
      return false;
    }
    if (month < 1 || month > 12) {
      alert("Month must be between 01 and 12.");
      return false;
    }

    const today = new Date();
    const age = today.getFullYear() - year;
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    const adjustedAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (adjustedAge < 17 || adjustedAge > 35) {
      alert("Age must be between 17 and 35 years.");
      return false;
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) return; 

    setSaving(true);

    try {
      const profileData = {
        ...formData,
        email: user.email,
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(doc(db, "profiles", user.uid), profileData, { merge: true });

      setProfileExists(true);
      alert("Profile has been successfully saved!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <h1 id="profile-header">Profile Information</h1>
      <div id="profile-form-container">
        <form id="profile-data-form" onSubmit={handleSave}>
          <label>Name:</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Phone:</label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label>USN / Registration Number:</label>
          <input
            type="text"
            id="usn"
            value={formData.usn}
            onChange={handleChange}
            required
          />

          <label>Course:</label>
          <input
            type="text"
            id="course"
            value={formData.course}
            onChange={handleChange}
            required
          />

          <label>Date of Birth:</label>
          <input
            type="date"
            id="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <label>Nationality:</label>
          <input
            type="text"
            id="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
          />

          <input
            type="submit"
            id="save-profile"
            value={saving ? "Saving..." : profileExists ? "Update Profile" : "Save Profile"}
            disabled={saving}
          />
        </form>
      </div>
    </>
  );
};

export default Profile;
