import { Routes, Route, Link } from "react-router-dom";
import "./styles/auth.css";
import "./styles/pages.css";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FreeTrial from "./pages/FreeTrial";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Schedule from "./pages/Schedule";
import Tasks from "./pages/Tasks";
import Budget from "./pages/Budget";
import RiskManagement from "./pages/RiskManagement";
import Documents from "./pages/Documents";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import Settings from "./pages/Settings";

function NotFound() {
  return (
    <div className="auth-page">
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>{"\u{1F6A7}"}</div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>Page Not Found</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "0.95rem" }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/free-trial" element={<FreeTrial />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/risk-management" element={<RiskManagement />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
