import webpush from "web-push";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  "mailto:info@smartmailbox.hu",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const client = new DynamoDBClient({ region: "eu-central-1" });

export const handler = async () => {
  console.log("Push Lambda started");

  try {
    const result = await client.send(
      new ScanCommand({
        TableName: process.env.PUSH_SUBSCRIPTIONS_TABLE
      })
    );

    const items = result.Items || [];
    console.log("Found subscriptions:", items.length);

    for (const item of items) {
      const sub = item.subscription.M;

      const subscription = {
        endpoint: sub.endpoint.S,
        expirationTime: null,
        keys: {
          p256dh: sub.keys.M.p256dh.S,
          auth: sub.keys.M.auth.S
        }
      };

      console.log("Sending push to:", subscription.endpoint);

      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: "SmartMailbox",
            body: "Új levél érkezett!",
            icon: "/icons/icon-192x192.png"
          })
        );
      } catch (err) {
        console.error("Push error:", err);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify("Push sent")
    };
  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify("Error sending push")
    };
  }
};