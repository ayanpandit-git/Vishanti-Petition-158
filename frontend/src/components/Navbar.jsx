import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar navbar-expand bg-white border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-semibold text-primary" to="/">
          Vishanti Petition
        </Link>
        <div className="d-flex gap-2">
          {isAuthenticated ? (
            <>
              {user.role === "student" && (
                <>
                  <Link
                    className="btn btn-outline-primary btn-sm"
                    to="/complaints"
                  >
                    My complaints
                  </Link>
                  <Link
                    className="btn btn-outline-primary btn-sm"
                    to="/complaints/new"
                  >
                    File complaint
                  </Link>
                </>
              )}
              {user.role === "reviewer" && (
                <Link className="btn btn-outline-primary btn-sm" to="/reviewer">
                  Assigned complaints
                </Link>
              )}
              {user.role === "authority" && (
                <Link
                  className="btn btn-outline-primary btn-sm"
                  to="/authority"
                >
                  Manage complaints
                </Link>
              )}
            </>
          ) : (
            <>
              <Link className="btn btn-outline-primary btn-sm" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary btn-sm" to="/register">
                Sign up
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <span className="small text-muted">{user.username}</span>
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
