
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ============================================================
// LOGIN / GENERAL PAGES
// ============================================================

import Login from "./pages/Login";
import Contact from "./pages/contact";

// ============================================================
// ADMIN PAGES
// ============================================================

import Dashboard from "./pages/Dashboard";
import Employee from "./pages/Employee";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AdminLayout from "./components/AdminLayout";

// ============================================================
// SUPER ADMIN PAGES
// ============================================================

import SuperAdminLayout from "./components/SuperAdminLayout";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminManagement from "./pages/AdminManagement";
import EmployeeManagement from "./pages/EmployeeManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import SuperAdminReports from "./pages/SuperAdminReports";
import SuperAdminSettings from "./pages/SuperAdminSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================
            LOGIN / GENERAL PAGES
        ================================================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/contact" element={<Contact />} />

        {/* ==================================================
            ADMIN ROUTES
        ================================================== */}

        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="employee"
            element={<Employee />}
          />

          <Route
            path="attendance"
            element={<Attendance />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>

        {/* ==================================================
            SUPER ADMIN ROUTES
        ================================================== */}

        <Route
          path="/super-admin"
          element={<SuperAdminLayout />}
        >
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<SuperAdminDashboard />}
          />

          <Route
            path="admins"
            element={<AdminManagement />}
          />

          <Route
            path="employees"
            element={<EmployeeManagement />}
          />

          <Route
            path="attendance"
            element={<AttendanceManagement />}
          />

          <Route
            path="reports"
            element={<SuperAdminReports />}
          />

          <Route
            path="settings"
            element={<SuperAdminSettings />}
          />
        </Route>

        {/* ==================================================
            DEFAULT ROUTE
        ================================================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
