import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hasCode = params.has("code");
        const hasState = params.has("state");

        if (hasCode && hasState) {
          // A Hosted UI redirect után a session már elérhető
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();

          if (idToken) {
            console.log("Sikeres bejelentkezés, ID token:", idToken);
            navigate("/", { replace: true });
          } else {
            console.error("Redirect után nincs idToken.");
            navigate("/login", { replace: true });
          }
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("OAuth redirect feldolgozási hiba:", err);
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  return <p>Bejelentkezés folyamatban...</p>;
}
