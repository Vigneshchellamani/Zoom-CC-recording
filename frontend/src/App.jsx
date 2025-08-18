import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import ZoomConfig from "./pages/ZoomConfig";
import "./styles.css";

function useUser() {
  const raw = localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Private({ children, role }) {
  const user = useUser();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route
          path="/admin"
          element={
            <Private role="admin">
              <AdminDashboard />
            </Private>
          }
        />
        <Route
          path="/agent"
          element={
            <Private role="agent">
              <AgentDashboard />
            </Private>
          }
        />
        <Route
          path="/zoom-config"
          element={
            <Private role="admin">
              <ZoomConfig />
            </Private>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
