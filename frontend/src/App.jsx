import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LogsPage from "./pages/LogsPage.jsx";
import "./styles/App.css";

export default function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/">Dashboard</Link>
        <Link to="/logs">Naplózás</Link>
        <Link to="/login">Bejelentkezés</Link>
        <Link to="/register">Regisztráció</Link>
      </nav>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}
