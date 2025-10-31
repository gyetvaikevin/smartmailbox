import React, { useState } from "react";
import "../styles/Forms.css";

function SetPasswordForm({ onSetPassword, deviceId }) {
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Küldés...");
    try {
      await onSetPassword(newPassword);
      setStatus("Siker: jelszó beállítva");
      setNewPassword("");
    } catch (err) {
      setStatus("Hiba: " + err.message);
    }
  };

  return (
    <div className="form-box">
      <h3>Set Password for {deviceId}</h3>
      <form className="app-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoComplete="off"
        />
        <button type="submit">Set Password</button>
      </form>
      {status && <p className="form-status">{status}</p>}
    </div>
  );
}

export default SetPasswordForm;
