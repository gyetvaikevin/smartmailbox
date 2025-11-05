const AWS = require("aws-sdk");
const iot = new AWS.IotData({ endpoint: process.env.IOT_ENDPOINT });

exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  const headers = {
    "Access-Control-Allow-Origin": event.headers?.origin || "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };

  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { deviceId, newPassword } = body || {};

    if (!deviceId || !newPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "deviceId and newPassword required" }),
      };
    }

    const params = {
      topic: `postalada/${deviceId}/cmd`,
      payload: JSON.stringify({ cmd: "set_password", newPassword }),
      qos: 0,
    };

    console.log("Publishing to IoT:", params);
    await iot.publish(params).promise();
    console.log("Publish success");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result: "password_change_sent" }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "internal_error", details: err.message }),
    };
  }
};
