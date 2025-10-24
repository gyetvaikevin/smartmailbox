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
    "Access-Control-Allow-Origin": "http://localhost:5173",
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

  // --- Audit log mentése ---
  await ddb.send(new PutCommand({
    TableName: "MailboxQRLogs-dev",
    Item: {
      deviceId,
      timestamp,
      qr: payload.qr || null,
      lock: payload.lock || "unknown",
      state: payload.state || null,
      trigger
    }
  }));

  // --- Aktuális állapot frissítése ---
  const lockField = payload.lock === "lock2" ? "lock2" : "lock1";
  const lockValue = payload.state === "OPEN";

  await ddb.send(new UpdateCommand({
    TableName: "SmartMailboxStorage-dev",
    Key: { deviceId },
    UpdateExpression: `SET ${lockField} = :val`,
    ExpressionAttributeValues: {
      ":val": lockValue
    }
  }));

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
