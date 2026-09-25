"use client";

import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Login failed.");
      return;
    }
    window.location.href = json.redirect || "/admin";
  }
  return (
    <div className="login">
      <form onSubmit={onSubmit}>
        <h1>Admin login</h1>
        <p>Temporary account must set a new password on first login.</p>
        {error ? <p className="error">{error}</p> : null}
        <label>Email<input name="email" type="email" autoComplete="username" required defaultValue="admin@example.com" /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="btn" type="submit">Sign in</button>
      </form>
    </div>
  );
}
