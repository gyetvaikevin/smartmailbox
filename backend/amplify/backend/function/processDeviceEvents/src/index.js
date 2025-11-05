const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  PutCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const ddb = DynamoDBDocumentClient.from(client);

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
    // "web" marad "web"
  }

  // --- Audit log CSAK status topic esetén és csak CLOSED állapotnál ---
  if (mqttTopic.includes("status") && !mqttTopic.includes("statusupdate")) {
    if (payload.state === "CLOSED") {
      await ddb.send(new PutCommand({
        TableName: "MailboxQRLogs-dev",
        Item: {
          deviceId,
          timestamp,
          lock: payload.lock || "unknown",
          state: payload.state,
          trigger,
          qr: payload.qr || null
        }
      }));
    }
  }

  // --- Aktuális állapot frissítése CSAK statusupdate topic esetén ---
  if (mqttTopic.includes("statusupdate")) {
    const lock1 = payload.lock1 === true;
    const lock2 = payload.lock2 === true;

    await ddb.send(new UpdateCommand({
      TableName: "SmartMailboxStorage-dev",
      Key: { deviceId },
      UpdateExpression: "SET lock1 = :l1, lock2 = :l2, lastUpdate = :ts",
      ExpressionAttributeValues: {
        ":l1": lock1,
        ":l2": lock2,
        ":ts": timestamp
      }
    }));
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
