import { useState } from "react";
import {
  signIn,
  signOut,
  signInWithRedirect,
} from "@aws-amplify/auth"; // modular API
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const result = await signIn({ username: email, password });
      if (result.isSignedIn) {
        setMsg("Sikeres bejelentkezés.");
        onLogin?.();
      } else {
        setMsg(`További lépés szükséges: ${result.nextStep.signInStep}`);
      }
    } catch (err) {
      setMsg(`Bejelentkezési hiba: ${err.message}`);
    }
  }

  async function handleGoogleLogin() {
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (err) {
      setMsg(`Google bejelentkezési hiba: ${err.message}`);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      setMsg("Sikeres kijelentkezés.");
      window.location.reload();
    } catch (err) {
      setMsg(`Kijelentkezési hiba: ${err.message}`);
    }
  }

  return (
    <div className="login-box">
      <h3>Bejelentkezés</h3>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Bejelentkezés</button>
      </form>

      <button onClick={handleGoogleLogin} className="google-btn">
        Google bejelentkezés
      </button>

      <button onClick={handleLogout} className="logout-btn">
        Kijelentkezés
      </button>

      <div className="msg">{msg}</div>
    </div>
  );
}
