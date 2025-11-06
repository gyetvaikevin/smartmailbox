import { useState, useEffect } from "react";
import { fetchAuthSession } from "@aws-amplify/auth"; // modular API
import "../styles/Logs.css";

export default function LogsTable({ deviceId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        // Amplify session lekérés modular API-val
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/logs?deviceId=${deviceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const parsed = raw.body ? JSON.parse(raw.body) : raw;
        setLogs(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        console.error("Hiba a logok lekérésekor:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    if (deviceId) fetchLogs();
  }, [deviceId]);

  if (loading) return <p>Betöltés...</p>;
  if (!logs.length) return <p>Nincsenek logok ehhez az eszközhöz.</p>;

  return (
    <table className="logs-table">
      <thead>
        <tr>
          <th>Időbélyeg</th>
          <th>Trigger</th>
          <th>Állapot</th>
          <th>QR</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, idx) => (
          <tr key={idx}>
            <td>{new Date(log.timestamp).toLocaleString()}</td>
            <td>{log.trigger}</td>
            <td>{log.state}</td>
            <td>{log.qr || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
