import webpush from "web-push";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  "mailto:info@smartmailbox.hu",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// DocumentClient, hogy ne kelljen .S/.N stb.
const ddbClient = new DynamoDBClient({ region: "eu-central-1" });
const ddb = DynamoDBDocumentClient.from(ddbClient);

export const handler = async () => {
  console.log("Push Lambda started");

  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: process.env.PUSH_SUBSCRIPTIONS_TABLE,
      })
    );

    const items = result.Items || [];
    console.log("Found subscriptions:", items.length);

    for (const item of items) {
      // 1) subscription mező ellenőrzése
      if (!item.subscription || typeof item.subscription !== "string") {
        console.error("Missing or non-string subscription field:", item);
        continue;
      }

      let subscription;
      try {
        subscription = JSON.parse(item.subscription);
      } catch (err) {
        console.error("Invalid subscription JSON in DB:", item.subscription, err);
        continue;
      }

      // 2) minimális szerkezeti ellenőrzés
      if (
        !subscription.endpoint ||
        !subscription.keys ||
        !subscription.keys.p256dh ||
        !subscription.keys.auth
      ) {
        console.error("Malformed PushSubscription object:", subscription);
        continue;
      }

      console.log("Sending push to endpoint:", subscription.endpoint);

      try {
        const payload = JSON.stringify({
          title: "SmartMailbox",
          body: "Új csomag érkezett!",
          deviceId: item.deviceId,
        });

        const res = await webpush.sendNotification(subscription, payload);
        console.log("Push response:", {
          statusCode: res.statusCode,
          headers: res.headers,
        });
      } catch (err) {
        // web-push itt már dob, ha az FCM nem 201-et ad vissza
        console.error("Push error:", {
          message: err.message,
          statusCode: err.statusCode,
          headers: err.headers,
          body: err.body,
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify("Push sent"),
    };
  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify("Error sending push"),
    };
  }
};