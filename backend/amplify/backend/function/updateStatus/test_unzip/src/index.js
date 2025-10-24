const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("event:", JSON.stringify(event));

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Érvénytelen JSON body" })
    };
  }

  const deviceId = payload.deviceId;
  const status = payload.status;
  const nowIso = new Date().toISOString();
  const lastUpdated = payload.lastUpdated || nowIso;

  if (!deviceId || !status) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Hiányzó kötelező mezők: deviceId, status" })
    };
  }

  const tableName = process.env.STORAGE_SMARTMAILBOXSTORAGE_NAME || "SmartMailboxStorage-dev";

  try {
    await ddb.put({
      TableName: tableName,
      Item: {
        deviceId,
        status,
        lastUpdated
      }
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ deviceId, status, lastUpdated })
    };
  } catch (err) {
    console.error("ddb.put hiba:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Nem sikerült frissíteni az állapotot" })
    };
  }
};
