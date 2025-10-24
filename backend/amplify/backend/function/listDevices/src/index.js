import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };

  try {
    const claims =
      event.requestContext?.authorizer?.claims ||
      event.requestContext?.authorizer?.jwt?.claims;

    // 🔑 Stabil azonosító: sub
    const userId = claims?.sub;
    if (!userId) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Invalid token (no sub)" }) };
    }

    const client = new DynamoDBClient({ region: process.env.REGION });
    const cmd = new QueryCommand({
      TableName: process.env.STORAGE_USERDEVICES_NAME,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": { S: userId } },
    });

    const result = await client.send(cmd);
    const devices = result.Items?.map((i) => i.deviceId.S) || [];

    return { statusCode: 200, headers, body: JSON.stringify({ devices }) };
  } catch (err) {
    console.error("Error in listDevices:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
