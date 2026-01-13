import { fetchAuthSession } from "@aws-amplify/auth";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(deviceId) {
  if (!deviceId) {
    alert("Nincs kiválasztott eszköz.");
    return;
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Ez a böngésző nem támogatja a push értesítéseket.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Az értesítések engedélyezése nélkül nem tudunk push-t küldeni.");
    return;
  }

  const swReg = await navigator.serviceWorker.ready;

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.error("Hiányzik a VITE_VAPID_PUBLIC_KEY env változó.");
    alert("Push konfigurációs hiba (VAPID kulcs hiányzik).");
    return;
  }

  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  const subscription = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // Auth token a Cognitótól
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) {
    throw new Error("Nincs érvényes bejelentkezés (idToken hiányzik).");
  }

  // Subscription elküldése a backend /subscribe endpointnak
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${apiBaseUrl}/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + idToken,
    },
    body: JSON.stringify({
      deviceId,
      subscription,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error("Subscription mentési hiba:", res.status, data);
    throw new Error(data.error || `Subscription failed (${res.status})`);
  }

  console.log("Push subscription mentve", { deviceId, subscription });
}