// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

import Layout from './components/layout/Layout';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard';
import Settings from './pages/Settings/Settings';
import ProjectManagement from "./pages/ProjectManagement/ProjectManagement";
import ReviewerDashboard from './pages/ReviewerDashboard/ReviewerDashboard';
import ProtectedRoute from "./components/common/ProtectedRoute";
import ServiceTracker from "./pages/ServiceTracker/ServiceTracker";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {jwtDecode} from "jwt-decode";
import {login} from "./store/userSlice";

export default function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            dispatch(login({
                username: decoded.username,
                workerId: parseInt(decoded.sub),
                role: decoded.role,
                isReviewer: decoded.isReviewer,
                token
            }));
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<Layout />}>
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                    <Route path="/service-tracker" element={
                        <ProtectedRoute>
                            <ServiceTracker />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    } />
                    <Route path="/projects" element={
                        <ProtectedRoute>
                            <ProjectManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/reviewer" element={
                        <ProtectedRoute>
                            <ReviewerDashboard />
                        </ProtectedRoute>
                    } />
                </Route>
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
    );
}