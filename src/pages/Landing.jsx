import { Link } from "react-router-dom";
import "../styles/landing.css";

function Landing() {
  return (
    <div className="landing">
      <div className="landing-border">
        <h1 className="landing-title">Welcome to ConPro</h1>
        <p className="landing-subtitle">
          Construction Project Management — Simplified
        </p>

        <div className="landing-actions">
          <Link to="/login" className="landing-btn">
            Login
          </Link>
          <Link to="/signup" className="landing-btn">
            Signup
          </Link>
          <Link to="/free-trial" className="landing-btn">
            Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;
