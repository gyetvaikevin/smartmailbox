// api.ts
import { fetchAuthSession } from "@aws-amplify/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function authHeader() {
  // Modular API: session lekérés
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error("Hiányzik az IdToken (jelentkezz be).");
  return { Authorization: `Bearer ${idToken}` };
}

/**
 * Eszköz státusz lekérése
 */
export async function getStatus(deviceId: string) {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeader()),
  };
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
export async function manual(deviceId: string, lock: "lock1" | "lock2") {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeader()),
  };
  const res = await fetch(`${API_BASE}/manual`, {
    method: "POST",
    headers,
    body: JSON.stringify({ deviceId, lock }),
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
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeader()),
  };
  const res = await fetch(`${API_BASE}/linkDevice`, {
    method: "POST",
    headers,
    body: JSON.stringify({ deviceId }),
  });
  if (!res.ok) throw new Error(`linkDevice hiba: ${res.status}`);
  return res.json();
}
