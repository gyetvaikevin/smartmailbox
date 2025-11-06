import { Amplify } from "@aws-amplify/core";
import "@aws-amplify/auth";

Amplify.configure({
  Auth: {
    // "flat" config a klasszikus UserPool inicializáláshoz
    region: import.meta.env.VITE_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,

    // Cognito blokk a Hosted UI / loginWith flow-hoz
    Cognito: {
      region: import.meta.env.VITE_REGION,
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      loginWith: {
        email: true,
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN,
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [
            "http://localhost:5173/auth/callback",
            "https://main.d2y8t9d4z5sf43.amplifyapp.com/auth/callback"
          ],
          redirectSignOut: [
            "http://localhost:5173/",
            "https://main.d2y8t9d4z5sf43.amplifyapp.com/"
          ],
          responseType: "code",
        },
      },
    },
  },
});

console.log("Amplify config:", Amplify.getConfig());
