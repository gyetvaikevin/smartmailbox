import { useState } from 'react';
import { linkDevice, listDevices } from '../api.ts';
import "../styles/Dashboard.css";

export default function RegisterDevice({ onDevices }) {
  const [newDevice, setNewDevice] = useState('');
  const [msg, setMsg] = useState('');

  async function handleRegister() {
    try {
      const res = await linkDevice(newDevice);
      if (res.success) {
        setMsg(`Eszköz hozzáadva: ${newDevice}`);
        setNewDevice('');
        const data = await listDevices();
        onDevices?.(data.devices || []);
      } else {
        setMsg('Hiba történt: ' + JSON.stringify(res));
      }
    } catch (err) {
      setMsg(`Hiba: ${err.message}`);
    }
  }

  return (
    <div className="register-device">
      <h3>Új postaláda regisztrálása</h3>
      <input
        placeholder="Eszköz ID"
        value={newDevice}
        onChange={e => setNewDevice(e.target.value)}
      />
      <button onClick={handleRegister}>Hozzáadás</button>
      <div className="msg">{msg}</div>
    </div>
  );
}
