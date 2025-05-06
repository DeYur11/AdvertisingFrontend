import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const user = useSelector(state => state.user);

    if (!user.username) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
