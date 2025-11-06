// api.ts
import { Auth } from "aws-amplify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function authHeader() {
  // Amplify 5/6 "sima" csomagban így kérsz sessiont:
  const session = await Auth.currentSession();
  const idToken = session.getIdToken().getJwtToken();
  if (!idToken) throw new Error("Hiányzik az IdToken (jelentkezz be).");
  return { Authorization: `Bearer ${idToken}` };
}

/**
 * Eszköz státusz lekérése
 */
export async function getStatus(deviceId: string) {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  const res = await fetch(`${API_BASE}/statusget`, {
    method: "POST",
    headers,
    body: JSON.stringify({ deviceId, limit: 1 }),
  });
  if (!res.ok) throw new Error(`statusget hiba: ${res.status}`);
  return res.json();
}

/**
 * Manuális nyitás/zárás
 */
export async function manual(
  lock: "lock1" | "lock2",
  action: "open" | "close",
  deviceId: string
) {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  const res = await fetch(`${API_BASE}/manual`, {
    method: "POST",
    headers,
    body: JSON.stringify({ deviceId, lock, action }),
  });
  if (!res.ok) throw new Error(`manual hiba: ${res.status}`);
  return res.json();
}

/**
 * Felhasználóhoz tartozó eszközök listázása
 */
export async function listDevices() {
  const headers = { ...(await authHeader()) };
  const res = await fetch(`${API_BASE}/listDevices`, { headers });
  if (!res.ok) throw new Error(`listDevices hiba: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.devices || [];
}

/**
 * Eszköz felhasználóhoz linkelése
 */
export async function linkDevice(deviceId: string) {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  const res = await fetch(`${API_BASE}/linkDevice`, {
    method: "POST",
    headers,
    body: JSON.stringify({ deviceId }),
  });
  if (!res.ok) throw new Error(`linkDevice hiba: ${res.status}`);
  return res.json();
}
