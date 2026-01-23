import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();

  const goToLogin = (role: string) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="landing-container">
      {/* Logo */}
      <img
        src="/quickpick-logo.png"
        alt="QuickPick"
        className="landing-logo"
      />

      <h1>Groceries delivered at lightning speed ⚡</h1>
      <p>Select how you want to continue</p>

      <div className="role-cards">
        <div className="role-card" onClick={() => goToLogin("customer")}>
          <h3>Customer</h3>
          <p>Shop groceries & track orders</p>
        </div>

        <div className="role-card" onClick={() => goToLogin("inventory")}>
          <h3>Inventory</h3>
          <p>Manage dark store orders</p>
        </div>

        <div className="role-card" onClick={() => goToLogin("delivery")}>
          
          <h3>Delivery Partner</h3>
          <p>Deliver orders fast</p>
        </div>
      </div>
    </div>
  );
}
