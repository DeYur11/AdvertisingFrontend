// src/components/layout/Header/Header.jsx
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery, gql } from "@apollo/client";
import ProfileMenu from "../../ui/ProfileMenu/ProfileMenu";
import NotificationBell from "../../ui/NotificationBell/NotificationBell";
import NotificationSidebar from "../../ui/NotificationSidebar/NotificationSidebar";
import Sidebar from "../Sidebar/Sidebar";
import MenuIcon from "@mui/icons-material/Menu";
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
    const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
    const [navigationSidebarOpen, setNavigationSidebarOpen] = useState(false);

    // Check if user is a manager
    const isManager = user.mainRole === "PROJECT_MANAGER";

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
        setNotificationSidebarOpen(!notificationSidebarOpen);
    };

    const toggleNavigationSidebar = () => {
        setNavigationSidebarOpen(!navigationSidebarOpen);
    };

    // Navigation links for the sidebar when user is a manager
    const managerNavLinks = [
        { to: "/", label: "Home" },
        { to: "/projects", label: "Project Management" },
        { to: "/service-tracker", label: "Service Tracker" },
        { to: "/employee-management", label: "Employee Management" },
        { to: "/service-dashboard", label: "Service Dashboard" }
    ];

    return (
        <>
            <header className="header">
                <div className="left-section">
                    {isManager ? (
                        <button
                            className="burger-menu-button"
                            onClick={toggleNavigationSidebar}
                            aria-label="Toggle navigation menu"
                        >
                            <MenuIcon />
                        </button>
                    ): (
                        <div className="logo">AdManager</div>
                    )
                    }
                </div>

                {isManager && (
                    <div className="center-section">
                        <div className="logo">AdManager</div>
                    </div>
                )}

                {!isManager && (
                    <nav className="nav">
                    {/* Navigation for non-manager roles */}
                        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                            Home
                        </NavLink>

                        {user.mainRole === "SCRUM_MASTER" && (
                            <NavLink to="/service-tracker" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                Service Tracker
                            </NavLink>
                        )}

                        {user.mainRole === "WORKER" && (
                            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                My Tasks
                            </NavLink>
                        )}

                        {user.isReviewer && (
                            <NavLink to="/reviewer" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                Review Materials
                            </NavLink>
                        )}
                    </nav>
                )}

                <div className="right-section">
                    {/* Add NotificationBell */}
                    <NotificationBell
                        materialIds={materialIds}
                        onToggleSidebar={toggleNotificationSidebar}
                    />
                    <ProfileMenu />
                </div>
            </header>

            {/* Navigation Sidebar for Managers */}
            <Sidebar
                isOpen={navigationSidebarOpen}
                onClose={() => setNavigationSidebarOpen(false)}
                navLinks={managerNavLinks}
            />

            {/* Notification Sidebar */}
            <NotificationSidebar
                isOpen={notificationSidebarOpen}
                onClose={() => setNotificationSidebarOpen(false)}
                materialIds={materialIds}
            />
        </>
    );
}