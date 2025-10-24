import { useState, useEffect } from "react";
import { getStatus, manual, listDevices } from "../api.ts";
import RegisterDevice from "../components/RegisterDevice.jsx";
import LockControls from "../components/LockControls.jsx";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [status, setStatus] = useState({ lock1: "UNKNOWN", lock2: "UNKNOWN" });
  const [note, setNote] = useState("");

  useEffect(() => {
    async function loadDevices() {
      try {
        const devs = await listDevices();
        setDevices(devs);
        if (devs.length) setDeviceId(devs[0]);
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

  return (
    <div className="dashboard">
      <h2>SmartMailbox Dashboard</h2>
      <div className="device-select">
        <select value={deviceId} onChange={e => setDeviceId(e.target.value)}>
          {devices.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button onClick={refresh}>Frissítés</button>
      </div>
      <LockControls status={status} deviceId={deviceId} onAction={manual} />
      <RegisterDevice onDevices={setDevices} />
      <div className="note">{note}</div>
    </div>
  );
}
