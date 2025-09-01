import React from 'react'
import Navbar from '../components/Navbar'
import '../styles/AdminDetails.css'
const AdminDetails = () => {
    const admins = [
    {
      name: "Mazen Saeed",
      email: "Smazen418@gmail.com",
      phone: "+91 8095354195",
      role: "Warden - A Block",
    },
    {
      name: "Zelnorain Khaliqi",
      email: "Zelnorain12@gmail.com",
      phone: "+91 6734165824",
      role: "Warden - B Block",
    },
    {
      name: "Jesvin Varghese",
      email: "Jesvinv4u@gmail.com",
      phone: "+91 8095736271",
      role: "Warden - C Block",
    },
    {
      name: "Syed Mohammed",
      email: "Syed123@gmail.com",
      phone: "+91 8095476121",
      role: "Campus Manager",
    },
    {
        name: "Ayman Seemadan",
        email: "Ayman.seemadan@gmail.com",
        phone: "+91 8095354175",
        role: "Campus Manager"
    },
    {
        name: "Harsh Jaiswal",
        email: "Harsh.jaiswal43@gmail.com",
        phone: '+91 9834327689',
        role: 'Warden - C Block'

    }
  ];

  return (
    <>
      <Navbar />
        <div className="admin-page">
      <h1>Admin Details</h1>
      <div className="admin-list">
        {admins.map((admin, index) => (
          <div key={index} className="admin-card">
            <h2>{admin.name}</h2>
            <p><strong>Email:</strong> {admin.email}</p>
            <p><strong>Phone:</strong> {admin.phone}</p>
            <p><strong>Role:</strong> {admin.role}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}

export default AdminDetails
