const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const deviceId = JSON.parse(event.body).deviceId;

  const headers = {
    "Access-Control-Allow-Origin": event.headers?.origin || "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };

  try {
    const result = await dynamo.get({
      TableName: "SmartMailboxStorage-dev",
      Key: { deviceId }
    }).promise();

    const item = result.Item;

    if (!item) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          deviceId,
          status: { lock1: "UNKNOWN", lock2: "UNKNOWN" }
        })
      };
    }

    // Közvetlen lock1/lock2 mezők olvasása
    const lock1 = item.lock1 === true ? "OPEN" :
                  item.lock1 === false ? "CLOSED" : "UNKNOWN";
    const lock2 = item.lock2 === true ? "OPEN" :
                  item.lock2 === false ? "CLOSED" : "UNKNOWN";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        deviceId: item.deviceId,
        lastUpdated: item.lastUpdated || null,
        status: { lock1, lock2 }
      })
    };

  } catch (err) {
    console.error("Error fetching status:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
