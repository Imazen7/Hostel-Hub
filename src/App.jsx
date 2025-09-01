import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

const UserLogin = lazy(() => import("./pages/UserLogin"));
const Password = lazy(() => import("./pages/Password"));
const SignUp = lazy(() => import("./pages/SignUp"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const UserHome = lazy(() => import("./pages/UserHome"));
const Profile = lazy(() => import("./pages/Profile"));
const BookRoom = lazy(() => import("./pages/BookRoom"));
const UserData = lazy(() => import("./components/UserData"));
const ChangeRoom = lazy(() => import("./pages/ChangeRoom"));
const Complaint = lazy(() => import("./pages/Complaint"));
const Outpass = lazy(() => import("./pages/Outpass"));
const AdminDetails = lazy(() => import("./pages/AdminDetails"));
const Vacate = lazy(() => import("./pages/Vacate"));
const AdminNavBar = lazy(() => import("./components/AdminNavBar"));
const BookStatus = lazy(() => import("./pages/Admin/BookStatus"));
const ChangeStatus = lazy(() => import("./pages/Admin/ChangeStatus"));
const VacateStatus = lazy(() => import("./pages/Admin/VacateStatus"));
const ViewComplaints = lazy(() => import("./pages/Admin/ViewComplaints"));
const OutpassManagement = lazy(() => import("./pages/Admin/OutpassManagement"));
const ConfirmedRooms = lazy(() => import("./pages/Admin/ConfirmedRooms"));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<UserLogin />} />
          <Route path="/Password" element={<Password />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/UserHome" element={<UserHome />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/BookRoom" element={<BookRoom />} />
          <Route path="/UserData" element={<UserData />} />
          <Route path="/ChangeRoom" element={<ChangeRoom />} />
          <Route path="/Complaint" element={<Complaint />} />
          <Route path="/Outpass" element={<Outpass />} />
          <Route path="/Admins" element={<AdminDetails />} />
          <Route path="/Vacate" element={<Vacate />} />

          <Route path="/AdminLogin" element={<AdminLogin />} />
          <Route
            path="/BookStatus"
            element={
              <ProtectedAdminRoute>
                <BookStatus />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/ChangeStatus"
            element={
              <ProtectedAdminRoute>
                <ChangeStatus />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/VacateStatus"
            element={
              <ProtectedAdminRoute>
                <VacateStatus />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/ViewComplaints"
            element={
              <ProtectedAdminRoute>
                <ViewComplaints />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/ManageOutpass"
            element={
              <ProtectedAdminRoute>
                <OutpassManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/ConfirmedRooms"
            element={
              <ProtectedAdminRoute>
                <ConfirmedRooms />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin-nav-bar"
            element={
              <ProtectedAdminRoute>
                <AdminNavBar />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
