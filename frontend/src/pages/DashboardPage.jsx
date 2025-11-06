import { useState, useEffect } from "react";
import { Auth } from "aws-amplify"; // sima aws-amplify-ból jön
import { getStatus, manual, listDevices } from "../api.js"; // figyelj: .js ha nem ts
import RegisterDevice from "../components/RegisterDevice.jsx";
import LockControls from "../components/LockControls.jsx";
import UnlockForm from "../components/UnlockForm.jsx";
import SetPasswordForm from "../components/SetPasswordForm.jsx";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(import.meta.env.VITE_DEVICE_ID || "");
  const [status, setStatus] = useState({ lock1: "UNKNOWN", lock2: "UNKNOWN" });
  const [note, setNote] = useState("");

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    async function loadDevices() {
      try {
        const devs = await listDevices();
        setDevices(devs);
        if (devs.length && !deviceId) setDeviceId(devs[0]);
      } catch (err) {
        console.error("Eszközlista hiba:", err);
      }
    }
    loadDevices();
  }, []);

  async function refresh() {
    if (!deviceId) return;
    try {
      const data = await getStatus(deviceId);
      setStatus(data.status);
    } catch (err) {
      setNote(`Állapot hiba: ${err.message}`);
    }
  }

  async function getAuthToken() {
    const session = await Auth.currentSession();
    const idToken = session.getIdToken().getJwtToken();
    return "Bearer " + idToken;
  }

  async function unlockDevice(password) {
    const token = await getAuthToken();
    const res = await fetch(`${apiBaseUrl}/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ deviceId, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Unlock failed");
    }
  }

  async function setPassword(newPassword) {
    const token = await getAuthToken();
    const res = await fetch(`${apiBaseUrl}/setPassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ deviceId, newPassword }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "SetPassword failed");
    }
  }

  return (
    <div className="dashboard">
      <h2>SmartMailbox Dashboard</h2>
      <div className="device-select">
        <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          {devices.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button onClick={refresh}>Frissítés</button>
      </div>

      <LockControls status={status} deviceId={deviceId} onAction={manual} />
      <RegisterDevice onDevices={setDevices} />

      <div className="forms-container">
        <UnlockForm onUnlock={unlockDevice} deviceId={deviceId} />
        <SetPasswordForm onSetPassword={setPassword} deviceId={deviceId} />
      </div>

      <div className="note">{note}</div>
    </div>
  );
}
