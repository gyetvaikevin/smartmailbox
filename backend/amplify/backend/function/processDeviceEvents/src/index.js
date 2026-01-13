const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const webpush = require("web-push");

// DynamoDB client
const client = new DynamoDBClient();
const ddb = DynamoDBDocumentClient.from(client);

// VAPID kulcsok beállítása
webpush.setVapidDetails(
  "mailto:info@smartmailbox.hu",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

function extractDeviceId(mqttTopic) {
  try {
    const parts = mqttTopic.split("/");
    return parts[1] || "unknown";
  } catch {
    return "unknown";
  }
}

exports.handler = async (event) => {
  console.log("Incoming IoT event:", JSON.stringify(event));

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": event.headers?.origin || "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };

  const mqttTopic = event.mqttTopic || event.topic || "";
  const deviceId = extractDeviceId(mqttTopic);
  const timestamp = new Date().toISOString();

  let payload = {};
  try {
    if (event.message && typeof event.message === "string") {
      payload = JSON.parse(event.message);
    } else if (event.payload && typeof event.payload === "string") {
      payload = JSON.parse(event.payload);
    } else {
      payload = event;
    }
  } catch (err) {
    console.error("Payload parse error:", err);
    payload = event;
  }

  // --- Trigger normalizálás ---
  let trigger = payload.trigger || "unknown";
  switch (trigger) {
    case "qr":
      trigger = "code";
      break;
    case "mqtt":
      trigger = "web";
      break;
    case "touch":
      trigger = "manual";
      break;
  }

  // --- Audit log CSAK status topic esetén és csak CLOSED állapotnál ---
  if (mqttTopic.includes("status") && !mqttTopic.includes("statusupdate")) {
    if (payload.state === "CLOSED") {
      await ddb.send(
        new PutCommand({
          TableName: "MailboxQRLogs-dev",
          Item: {
            deviceId,
            timestamp,
            lock: payload.lock || "unknown",
            state: payload.state,
            trigger,
            qr: payload.qr || null
          }
        })
      );

      // --- PUSH ÉRTESÍTÉS KÜLDÉSE ---
      try {
        const subs = await ddb.send(
          new QueryCommand({
            TableName: process.env.PUSH_SUBSCRIPTIONS_TABLE,
            KeyConditionExpression: "deviceId = :d",
            ExpressionAttributeValues: {
              ":d": deviceId
            }
          })
        );

        for (const sub of subs.Items) {
          try {
            await webpush.sendNotification(
              sub.subscription,
              JSON.stringify({
                title: "SmartMailbox",
                body: "A postaládát bezárták.",
                deviceId
              })
            );
          } catch (err) {
            console.error("Push error:", err);

            // Ha a subscription érvénytelen → töröljük
            if (err.statusCode === 410 || err.statusCode === 404) {
              await ddb.send(
                new DeleteCommand({
                  TableName: process.env.PUSH_SUBSCRIPTIONS_TABLE,
                  Key: {
                    deviceId,
                    subscriptionId: sub.subscriptionId
                  }
                })
              );
            }
          }
        }
      } catch (err) {
        console.error("Subscription query error:", err);
      }
    }
  }

  // --- Aktuális állapot frissítése CSAK statusupdate topic esetén ---
  if (mqttTopic.includes("statusupdate")) {
    const lock1 = payload.lock1 === true;
    const lock2 = payload.lock2 === true;

    await ddb.send(
      new UpdateCommand({
        TableName: "SmartMailboxStorage-dev",
        Key: { deviceId },
        UpdateExpression: "SET lock1 = :l1, lock2 = :l2, lastUpdate = :ts",
        ExpressionAttributeValues: {
          ":l1": lock1,
          ":l2": lock2,
          ":ts": timestamp
        }
      })
    );
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};