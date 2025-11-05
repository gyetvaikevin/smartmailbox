import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleSignIn, fetchAuthSession } from "@aws-amplify/auth";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hasCode = params.has("code");
        const hasState = params.has("state");

        if (hasCode && hasState) {
          await handleSignIn(); // Cognito redirect feldolgozása
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();
          if (idToken) {
            navigate("/", { replace: true });
          } else {
            navigate("/login", { replace: true });
          }
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("AuthCallback hiba:", err);
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  return <p>Bejelentkezés folyamatban...</p>;
}
