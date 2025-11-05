const AWS = require('aws-sdk');
const iot = new AWS.IotData({ endpoint: process.env.IOT_ENDPOINT });

exports.handler = async (event) => {
  console.log("event:", JSON.stringify(event));

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    body = {};
  }

  const deviceId = body.deviceId || "SmartMailbox1";
  const lock = body.lock === "lock2" ? 2 : 1;
  const cmd = lock === 2 ? "open_lock2" : "open_lock1";

  const headers = {
    "Access-Control-Allow-Origin": event.headers?.origin || "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };

  try {
    await iot.publish({
      topic: `postalada/${deviceId}/cmd`,
      payload: JSON.stringify({ cmd }),
      qos: 0
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: `Command '${cmd}' sent to ${deviceId}` })
    };
  } catch (err) {
    console.error("IoT publish error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "IoT publish failed" })
    };
  }
};
