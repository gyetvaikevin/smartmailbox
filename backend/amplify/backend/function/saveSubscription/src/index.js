import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const allowedOrigins = [
  "http://localhost:5173",
  "https://main.d2y8t9d4z5sf43.amplifyapp.com",
];

export const handler = async (event) => {
  const origin = event.headers?.origin;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  // Preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Cognito user azonosítása
    const claims =
      event.requestContext?.authorizer?.claims ||
      event.requestContext?.authorizer?.jwt?.claims;

    const userId = claims?.sub;
    if (!userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "Invalid token (no sub)" }),
      };
    }

    // Body parse
    let body;
    try {
      body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { deviceId, type, subscription } = body || {};

    if (!deviceId || !type || !subscription) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "deviceId, type és subscription kötelező",
        }),
      };
    }

    const tableName = process.env.PUSH_SUBSCRIPTIONS_TABLE;

    // SK = userId#type (pl. user123#webpush)
    const subscriptionId = `${userId}#${type}`;

    // Mentés DynamoDB-be
    await ddb.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          deviceId,
          subscriptionId,
          userId,
          type,          // "webpush"
          subscription,  // teljes subscription JSON
          createdAt: new Date().toISOString(),
        },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("saveSubscription error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error", detail: err.message }),
    };
  }
};