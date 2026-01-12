export default function LockControls({ status, deviceId, onAction }) {
  if (!deviceId) return <p>Nincs kiválasztott eszköz.</p>;

  return (
    <div className="locks">
      {["lock1", "lock2"].map((lock) => (
        <div key={lock} className="lock-card">
          <h3>{lock.toUpperCase()}</h3>

          <div
            className="lock-status"
            style={{
              background: status[lock] === "OPEN" ? "#2ecc71" : "#e74c3c",
            }}
          />

          <p>Állapot: {status[lock]}</p>

          <div className="lock-buttons">
            <button onClick={() => onAction(deviceId, lock)}>Nyitás</button>
          </div>
        </div>
      ))}
    </div>
  );
}