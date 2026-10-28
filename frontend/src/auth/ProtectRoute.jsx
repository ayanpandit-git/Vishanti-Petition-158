import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectRoute({ children, roles }) {
    const { user, isAuthenticated, authLoading } = useAuth();

    if(authLoading) {
        return (
            <div className="container py-5">
                <p>Checking your session...</p>
            </div>
        );
    }

    if(!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if(roles && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}