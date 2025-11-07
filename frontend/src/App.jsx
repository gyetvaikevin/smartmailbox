import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LogsPage from "./pages/LogsPage.jsx";
import "./styles/App.css";
import AuthCallback from "./pages/AuthCallback.jsx";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <header className="navbar">
        <div className="logo">SmartMailbox</div>
        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/logs" onClick={() => setMenuOpen(false)}>Naplózás</Link>
          <Link to="/login" onClick={() => setMenuOpen(false)}>Bejelentkezés</Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}>Regisztráció</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
    </Router>
  );
}
