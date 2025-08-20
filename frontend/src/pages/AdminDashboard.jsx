import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import EngagementTable from "../components/EngagementTable";
import api from "../services/api";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    api
      .get("/engagements/all")
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="dashboard">
      <Sidebar role="admin" />
      <div className="main-content">
        <div className="hero">
          <div>
            <h2>Welcome, {user?.username}</h2>
            <p>Manage your company’s engagements and Zoom configuration.</p>
          </div>
          <div className="badge">Admin</div>
        </div>
        {/* <div className="cards">
          <div className="card">
            Ready/Not Ready: <span className="pill pill-green">Ready</span>
          </div>
        </div> */}
        <h3 style={{ marginTop: 20 }}>All Engagements</h3>
      </div>
    </div>
  );
}
