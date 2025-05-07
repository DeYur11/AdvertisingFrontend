import { NavLink } from "react-router-dom";
import ProfileMenu from "../../ui/ProfileMenu/ProfileMenu";
import { useSelector } from "react-redux";
import "./Header.css";

export default function Header() {
    const user = useSelector(state => state.user);

    return (
        <header className="header">
            <div className="left-section">
                <div className="logo">AdManager</div>
            </div>

            <nav className="nav">
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
                <ProfileMenu />
            </div>
        </header>
    );
}