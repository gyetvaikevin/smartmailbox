self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "SmartMailbox", body: "Új értesítés érkezett." };
  }

  const title = data.title || "SmartMailbox";
  const body = data.body || "Új értesítés érkezett.";
  const options = {
    body,
    icon: "/icon-192.png", 
    badge: "/icon-192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/logs") 
  );
});