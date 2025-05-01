import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const user = useSelector(state => state.user);

    if (!user.name) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
