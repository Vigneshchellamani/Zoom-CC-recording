import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h3>Zoom CC</h3>
      <p className="muted">{user?.username} ({role})</p>
      <ul>
        <li><Link to={`/${role}`}>Home</Link></li>
        <li><Link to="#">My Engagements</Link></li>
        <li><Link to="#">All Engagements</Link></li>
        <li><Link to="#">Team</Link></li>
        {role === "admin" && <li><Link to="/zoom-config">Zoom Config</Link></li>}
      </ul>
      <button className="secondary" onClick={logout}>Logout</button>
    </div>
  );
}
