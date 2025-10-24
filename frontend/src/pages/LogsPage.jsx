import { useState, useEffect } from "react";
import { listDevices } from "../api.ts";
import LogsTable from "../components/LogsTable.jsx";
import "../styles/Logs.css";

export default function LogsPage() {
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    async function loadDevices() {
      try {
        const devs = await listDevices();
        setDevices(devs);
        // csak akkor állítjuk be, ha még nincs kiválasztva
        if (devs.length > 0 && !deviceId) {
          setDeviceId(devs[0]);
        }
      } catch (err) {
        console.error("Eszközlista hiba:", err);
        setDevices([]);
      }
    }
    loadDevices();
  }, []); // csak egyszer fusson le

  return (
    <div className="logs-page">
      <h2>Audit napló</h2>

      {devices.length === 0 ? (
        <p>Nincsenek eszközök a felhasználóhoz linkelve.</p>
      ) : (
        <>
          <div className="device-select">
            <label>Eszköz: </label>
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            >
              {devices.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {deviceId && <LogsTable deviceId={deviceId} />}
        </>
      )}
    </div>
  );
}
