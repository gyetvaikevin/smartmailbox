/* Amplify Lambda PostConfirmation trigger: PostConfirmationClean */
const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient();

exports.handler = async (event, context, callback) => {
  console.log("PostConfirmationClean event:", JSON.stringify(event, null, 2));

  const params = {
    GroupName: "customer", // ide kerül minden új user
    UserPoolId: event.userPoolId,
    Username: event.userName
  };

  try {
    const command = new AdminAddUserToGroupCommand(params);
    await client.send(command);
    console.log(`User ${event.userName} added to group 'customer'`);
    return callback(null, event);
  } catch (err) {
    console.error("Error adding user to group:", err);
    return callback(err);
  }
};
