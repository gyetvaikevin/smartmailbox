import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": event.headers?.origin || "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };

  try {
    const claims =
      event.requestContext?.authorizer?.claims ||
      event.requestContext?.authorizer?.jwt?.claims;

    // 🔑 Stabil azonosító: sub (mindig van)
    const userId = claims?.sub;
    if (!userId) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Invalid token (no sub)" }) };
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
    }

    const deviceId = body.deviceId;
    if (!deviceId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing deviceId" }) };
    }

    const client = new DynamoDBClient({ region: process.env.REGION });
    const cmd = new PutItemCommand({
      TableName: process.env.STORAGE_USERDEVICES_NAME,
      Item: {
        userId: { S: userId },
        deviceId: { S: deviceId },
        // opcionálisan tárolhatod az emailt is, ha van
        ...(claims?.email ? { email: { S: claims.email } } : {})
      },
    });

    await client.send(cmd);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, userId, deviceId }) };
  } catch (err) {
    console.error("Error in linkDevice:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
