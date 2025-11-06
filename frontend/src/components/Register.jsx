import { useState } from "react";
import {
  signUp,
  confirmSignUp,
  signInWithRedirect,
} from "@aws-amplify/auth"; // modular API
import "../styles/Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await signUp({
        username: email,
        password,
        options: { userAttributes: { email } }, // modular API-nál "options"
      });
      setMsg("Regisztráció sikeres, ellenőrizd az emailt a kóddal.");
    } catch (err) {
      setMsg(`Regisztrációs hiba: ${err.message}`);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setMsg("Regisztráció megerősítve, most már bejelentkezhetsz.");
    } catch (err) {
      setMsg(`Megerősítési hiba: ${err.message}`);
    }
  }

  async function handleGoogleRegister() {
    try {
      // Hosted UI redirect indítása Google providerrel
      await signInWithRedirect({ provider: "Google" });
    } catch (err) {
      setMsg(`Google regisztráció/bejelentkezés hiba: ${err.message}`);
    }
  }

  return (
    <div className="register-box">
      <h3>Regisztráció</h3>
      <form onSubmit={handleRegister} className="register-form">
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
        <button type="submit">Regisztráció</button>
      </form>

      <form onSubmit={handleConfirm} className="confirm-form">
        <input
          placeholder="Megerősítő kód"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit">Megerősítés</button>
      </form>

      <button onClick={handleGoogleRegister} className="google-btn">
        Google regisztráció / bejelentkezés
      </button>

      <div className="msg">{msg}</div>
    </div>
  );
}
