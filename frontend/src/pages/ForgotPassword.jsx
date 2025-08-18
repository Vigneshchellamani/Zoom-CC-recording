import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot", { email });
      setSent(true);
    } catch {
      setSent(true);
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      {!sent ? (
        <form onSubmit={submit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button>Send Reset Link</button>
        </form>
      ) : (
        <p>Please check your email (if registered).</p>
      )}
      <p className="links">
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}
