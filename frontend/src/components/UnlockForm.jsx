import React, { useState } from "react";
import "../styles/Forms.css";

function UnlockForm({ onUnlock, deviceId }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Küldés...");
    try {
      await onUnlock(password);
      setStatus("Siker: parancs elküldve");
      setPassword("");
    } catch (err) {
      setStatus("Hiba: " + err.message);
    }
  };

  return (
    <div className="form-box">
      <h3>Unlock Device ({deviceId})</h3>
      <form className="app-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Unlock code"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="one-time-code"
        />
        <button type="submit">Unlock</button>
      </form>
      {status && <p className="form-status">{status}</p>}
    </div>
  );
}

export default UnlockForm;
