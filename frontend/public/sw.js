// 🔔 PUSH EVENT 
self.addEventListener("push", (event) => {
  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    data = {};
  }

  const title = data.title || "SmartMailbox";
  const body = data.body || "Új értesítés érkezett.";
  const icon = data.icon || "/appicon.png";
  const badge = data.badge || "/appicon.png";

  const options = {
    body,
    icon,
    badge,
    data: {
      url: data.url || "/logs"
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 👆 KATTINTÁS 
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/logs";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});