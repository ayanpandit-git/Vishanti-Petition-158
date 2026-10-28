import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import NewComplaintPage from "./pages/NewComplaintPage";
import Navbar from "./components/Navbar";
import ProtectRoute from "./auth/ProtectRoute";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/complaints" : "/login"} replace />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/complaints" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/complaints" replace />
            ) : (
              <RegisterPage />
            )
          }
        />
        <Route
          path="/complaints"
          element={
            <ProtectRoute>
              <ComplaintsPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/complaints/new"
          element={
            <ProtectRoute roles={["student"]}>
              <NewComplaintPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/reviewer"
          element={
            <ProtectRoute roles={["reviewer"]}>
              <div className="container py-5">
                <h1 className="h2">Reviewer dashboard</h1>
                <p className="text-muted">
                  The assigned complaints will appear here.
                </p>
              </div>
            </ProtectRoute>
          }
        />
        <Route
          path="/authority"
          element={
            <ProtectRoute roles={["authority"]}>
              <div className="container py-5">
                <h1 className="h2">Authority dashboard</h1>
                <p className="text-muted">
                  All complaints will be managed here.
                </p>
              </div>
            </ProtectRoute>
          }
        />
        <Route
          path="/unauthorized"
          element={
            <div className="container py-5">
              <h1>Access denied</h1>
              <p>You don't have permission to view this page.</p>
            </div>
          }
        />
        <Route
          path="*"
          element={
            <main className="container py-5">
              <h1>Page not found</h1>
              <p>The page you requested does not exist.</p>
            </main>
          }
        />
      </Routes>
    </>
  );
}
