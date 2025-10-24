const {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminLinkProviderForUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient();

exports.handler = async (event, context, callback) => {
  console.log("PreSignupClean event:", JSON.stringify(event, null, 2));

  try {
    const email = event.request.userAttributes.email;
    if (!email) {
      return callback(new Error("Email is required for registration."));
    }

    // Csak külső IdP esetén próbálunk linkelni
    if (event.triggerSource === "PreSignUp_ExternalProvider") {
      const listCmd = new ListUsersCommand({
        UserPoolId: event.userPoolId,
        Filter: `email = "${email}"`,
        Limit: 1
      });
      const response = await client.send(listCmd);

      if (response.Users && response.Users.length > 0) {
        const existingUser = response.Users[0];

        console.log("Linking federated user to existing account:", existingUser.Username);

        const linkCmd = new AdminLinkProviderForUserCommand({
          UserPoolId: event.userPoolId,
          DestinationUser: {
            ProviderName: "Cognito",
            ProviderAttributeValue: existingUser.Username
          },
          SourceUser: {
            ProviderName: event.userName.split("_")[0], // pl. "Google"
            ProviderAttributeName: "Cognito_Subject",
            ProviderAttributeValue: event.userName.split("_")[1]
          }
        });

        await client.send(linkCmd);
      }
    }

    return callback(null, event);
  } catch (err) {
    console.error("Error in PreSignupClean:", err);
    return callback(err);
  }
};
