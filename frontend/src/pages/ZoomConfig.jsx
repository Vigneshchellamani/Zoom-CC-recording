import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function ZoomConfig() {
  const [form, setForm] = useState({
    clientId: "",
    clientSecret: "",
    accountId: "",
  });
  const [mask, setMask] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/config/zoom")
      .then(setMask)
      .catch(() => setMask(null));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/config/zoom", form);
      alert("Saved. Values stored encrypted.");
      setForm({ clientId: "", clientSecret: "", accountId: "" });
      const m = await api.get("/config/zoom");
      setMask(m);
    } catch (e) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar role="admin" />
      <div className="main-content">
        <h2>Zoom CC Config (Admin)</h2>
        {mask && (
          <div className="note">
            <strong>Current:</strong> Client ID {mask.clientId || "-"}, Account{" "}
            {mask.accountId || "-"} (secret hidden)
          </div>
        )}
        <form className="config-form" onSubmit={save}>
          <input
            placeholder="Client ID"
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            required
          />
          <input
            placeholder="Client Secret"
            value={form.clientSecret}
            onChange={(e) => setForm({ ...form, clientSecret: e.target.value })}
            required
          />
          <input
            placeholder="Account ID"
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            required
          />
          <button disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </form>
      </div>
    </div>
  );
}
