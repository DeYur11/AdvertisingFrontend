import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from "./component/Header/Header";
import Login from "./component/Login/Login";
import Settings from "./component/page/Settings/Settings";
import Home from "./component/page/Home";
import EmployeeDashboard from "./component/page/EmployeeDashboard/EmployeeDashboard";
import ProtectedRoute from "./component/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProjectsPage from "./component/page/ProjectsPage/ProjectsPage";
import MaterialReviewPage from "./component/page/ai-chat-code-2025-04-30T23-04-59-621Z";

function AppContent() {
    const location = useLocation();

    return (
        <>
            {/* Показуємо Header тільки якщо ми НЕ на /login */}
            {location.pathname !== "/login" && <Header />}

            <main>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/public"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projectsDashboard"
                        element={
                            <ProtectedRoute>
                                <ProjectsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <EmployeeDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/about"
                        element={
                            <ProtectedRoute>
                                <MaterialReviewPage/>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>

            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}
