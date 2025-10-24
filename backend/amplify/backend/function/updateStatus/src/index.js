const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };

  let body = {};
  let deviceId = "SmartMailbox1";

  if (event.pathParameters && event.pathParameters.deviceId) {
    deviceId = event.pathParameters.deviceId;
  }
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      body = {};
    }
  }
  if (!event.body && !event.pathParameters) {
    body = event;
    if (event.deviceId) deviceId = event.deviceId;
  }

  let status = body.status || {};
  if (typeof status === "string") {
    try { status = JSON.parse(status); } catch { status = { raw: status }; }
  }

  const lastUpdated = new Date().toISOString();

  try {
    await ddb.put({
      TableName: "SmartMailboxStorage-dev",
      Item: { deviceId, status, lastUpdated }
    }).promise();

    return { statusCode: 200, headers, body: JSON.stringify({ deviceId, status, lastUpdated }) };
  } catch {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Nem sikerült frissíteni az állapotot" }) };
  }
};
