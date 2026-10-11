
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import Notifications from "./pages/student/Notifications";
import Companies from "./pages/student/Companies";
import PlacementDrives from "./pages/student/PlacementDrives";
import CompanyDetails from "./pages/student/CompanyDetails";
import ApplicationForm from "./pages/student/ApplicationForm";
import MyApplications from "./pages/student/MyApplications";

import OfficerDashboard from "./pages/officer/OfficerDashboard";
import Applicants from "./pages/officer/Applicants";
import ManageCompanies from "./pages/officer/ManageCompanies";
import OfficerPlacementDrives from "./pages/officer/PlacementDrives";
import OfficerNotifications from "./pages/officer/OfficerNotifications";

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Pages */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/notifications" element={<Notifications />} />
      <Route path="/student/companies" element={<Companies />} />
      <Route path="/student/drives" element={<PlacementDrives />} />
      <Route
        path="/student/companies/:companyName"
        element={<CompanyDetails />}
      />
      <Route
        path="/student/apply/:companyName"
        element={<ApplicationForm />}
      />
      <Route
        path="/student/applications"
        element={<MyApplications />}
      />

      {/* Officer Pages */}
      <Route path="/officer" element={<OfficerDashboard />} />
      <Route
        path="/officer/companies"
        element={<ManageCompanies />}
      />
      <Route
        path="/officer/drives"
        element={<OfficerPlacementDrives />}
      />
      <Route path="/officer/applicants" element={<Applicants />} />
      <Route
        path="/officer/notifications"
        element={<OfficerNotifications />}
      />

      {/* Unknown URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
