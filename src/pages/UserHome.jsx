import React from 'react'
import Navbar from '../components/Navbar'
import '../styles/UserHome.css' 

const UserHome = () => {
  return (
    <>
      <Navbar />
      <div id="about-app">
        <p>Hostel Hub is a platform that is used for managing room bookings, vacate requests, outpass requests, and complaints for student hostels. It provides functionality for users to register, book rooms, update their profiles, and for administrators to review and manage vacate requests, outpass requests, 
        and complaints.</p>
      </div>
    </>
  )
}

export default UserHome;
