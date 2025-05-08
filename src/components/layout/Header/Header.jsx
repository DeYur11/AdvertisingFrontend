// src/components/layout/Header/Header.jsx
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery, gql } from "@apollo/client";
import ProfileMenu from "../../ui/ProfileMenu/ProfileMenu";
import NotificationBell from "../../ui/NotificationBell/NotificationBell";
import NotificationSidebar from "../../ui/NotificationSidebar/NotificationSidebar";
import "./Header.css";

// Query to get all materials associated with this worker
const GET_WORKER_MATERIALS = gql`
    query GetWorkerMaterials($workerId: ID!) {
        materialsByWorker(workerId: $workerId) {
            id
        }
    }
`;

export default function Header() {
    const user = useSelector(state => state.user);
    const [materialIds, setMaterialIds] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Fetch all material IDs associated with this worker
    const { data } = useQuery(GET_WORKER_MATERIALS, {
        variables: { workerId: user.workerId },
        skip: !user.workerId,
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        if (data?.materialsByWorker) {
            setMaterialIds(data.materialsByWorker.map(material => parseInt(material.id)));
        }
    }, [data]);

    const toggleNotificationSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            <header className="header">
                <div className="left-section">
                    <div className="logo">AdManager</div>
                </div>

                <nav className="nav">
                    {/* Existing navigation links */}
                    <NavLink to="/" end className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                        Home
                    </NavLink>

                    {/* Access to Admin Panel only for Project Manager */}
                    {user.mainRole === "PROJECT_MANAGER" && (
                        <>
                            <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                Project Management
                            </NavLink>
                            <NavLink to="/service-tracker" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                Service Tracker
                            </NavLink>
                            <NavLink to="/employee-management" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                Employee Management
                            </NavLink>
                            <NavLink to="/service-dashboard" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                Service Dashboard
                            </NavLink>
                        </>
                    )}

                    {user.mainRole === "SCRUM_MASTER" && (
                        <NavLink to="/service-tracker" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                            Service Tracker
                        </NavLink>
                    )}
                    {/* Access to Dashboard only for Worker */}
                    {user.mainRole === "WORKER" && (
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                            My Tasks
                        </NavLink>
                    )}

                    {/* Access to Reviewer Dashboard only for Reviewers */}
                    {user.isReviewer && (
                        <NavLink to="/reviewer" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                            Review Materials
                        </NavLink>
                    )}
                </nav>

                <div className="right-section">
                    {/* Add NotificationBell */}
                    <NotificationBell
                        materialIds={materialIds}
                        onToggleSidebar={toggleNotificationSidebar}
                    />
                    <ProfileMenu />
                </div>
            </header>

            {/* Add NotificationSidebar */}
            <NotificationSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                materialIds={materialIds}
            />
        </>
    );
}