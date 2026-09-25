"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
  const [error, setError] = useState("");
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Could not change password.");
      return;
    }
    window.location.href = json.redirect || "/admin";
  }
  return (
    <div className="login">
      <form onSubmit={onSubmit}>
        <h1>Set a new password</h1>
        <p className="notice">This temporary admin password cannot be reused. Use at least 12 characters.</p>
        {error ? <p className="error">{error}</p> : null}
        <label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required /></label>
        <label>New password<input name="nextPassword" type="password" autoComplete="new-password" minLength={12} required /></label>
        <button className="btn" type="submit">Save password</button>
      </form>
    </div>
  );
}
