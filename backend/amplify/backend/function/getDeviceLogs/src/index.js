import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": event.headers?.origin || "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,Origin,Accept",
    "Access-Control-Allow-Methods": "GET,OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const qs = event.queryStringParameters || {};
    const deviceId = qs.deviceId;

    let limit = parseInt(qs.limit, 10);
    if (isNaN(limit) || limit <= 0) limit = 20;
    limit = Math.min(limit, 100);

    if (!deviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing deviceId" })
      };
    }

    const cmd = new QueryCommand({
      TableName: process.env.STORAGE_MAILBOXQRLOGS_NAME,
      KeyConditionExpression: "deviceId = :d",
      ExpressionAttributeValues: { ":d": deviceId },
      ScanIndexForward: false,
      Limit: limit
    });

    const res = await ddb.send(cmd);
    console.log("DynamoDB response:", JSON.stringify(res));

    const items = (res.Items || []).map(i => ({
      timestamp: i.timestamp,
      lock: i.lock,
      state: i.state,
      trigger: i.trigger,
      qr: i.qr ?? null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(items)
    };
  } catch (err) {
    console.error("getDeviceLogs error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error", detail: err.message })
    };
  }
};
