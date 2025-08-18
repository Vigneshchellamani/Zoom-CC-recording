import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import EngagementTable from "../components/EngagementTable";
import api from "../services/api";

export default function AgentDashboard() {
  const [items, setItems] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    api
      .get("/engagements/mine")
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="dashboard">
      <Sidebar role="agent" />
      <div className="main-content">
        <div className="hero">
          <div>
            <h2>Welcome, {user?.username}</h2>
            <p>Your company’s recent engagements are listed below.</p>
          </div>
          <div className="badge">Agent</div>
        </div>
        <div className="cards">
          <div className="card">
            Ready/Not Ready: <span className="pill pill-yellow">Not Ready</span>
          </div>
        </div>
        <h3 style={{ marginTop: 20 }}>My Engagements</h3>
        <EngagementTable items={items} />
      </div>
    </div>
  );
}
