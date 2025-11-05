const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": event.headers?.origin || "*",
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

  // Szedd ki a lock értékeket
  let lock1 = null;
  let lock2 = null;

  if (body.status) {
    lock1 = body.status.lock1 === true || body.status.lock1 === "true";
    lock2 = body.status.lock2 === true || body.status.lock2 === "true";
  } else {
    if (typeof body.lock1 !== "undefined") lock1 = body.lock1 === true || body.lock1 === "true";
    if (typeof body.lock2 !== "undefined") lock2 = body.lock2 === true || body.lock2 === "true";
  }

  const lastUpdated = new Date().toISOString();

  try {
    await ddb.put({
      TableName: "SmartMailboxStorage-dev",
      Item: { deviceId, lock1, lock2, lastUpdated }
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ deviceId, lock1, lock2, lastUpdated })
    };
  } catch (err) {
    console.error("DynamoDB put error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Nem sikerült frissíteni az állapotot" })
    };
  }
};
