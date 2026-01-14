// 🔔 PUSH EVENT
self.addEventListener("push", (event) => {
  console.log("SW: push event received");

  let data = {};

  try {
    if (event.data) {
      // Nyers payload logolása debughoz
      const raw = event.data.text();
      console.log("SW: raw push data =", raw);

      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.warn("SW: JSON parse failed, fallback üres data-ra", e);
        data = {};
      }
    }
  } catch (err) {
    console.error("SW: event.data elérés hiba", err);
    data = {};
  }

  const title = data.title || "SmartMailbox";
  const body = data.body || "Új értesítés érkezett.";
  const icon = data.icon || "/appicon.png";
  const badge = data.badge || "/appicon.png";
  const url = data.url || "/logs";

  const options = {
    body,
    icon,
    badge,
    data: { url },
  };

  console.log("SW: showNotification hívás", { title, options });

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 👆 KATTINTÁS
self.addEventListener("notificationclick", (event) => {
  console.log("SW: notification click", event.notification);

  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/logs";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            console.log("SW: meglévő kliens fókuszálása", client.url);
            return client.focus();
          }
        }

        console.log("SW: új ablak nyitása", targetUrl);
        return clients.openWindow(targetUrl);
      })
      .catch((err) => {
        console.error("SW: notificationclick hiba", err);
      })
  );
});