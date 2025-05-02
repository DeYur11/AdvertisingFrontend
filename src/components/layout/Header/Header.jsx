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
                <NavLink to="/public" end className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                    Home
                </NavLink>

                <NavLink to="/about" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                    About
                </NavLink>

                {/* Access to Services for Project Manager or Scrum Master */}
                {(user.mainRole === "ProjectManager" || user.mainRole === "ScrumMaster") && (
                    <NavLink to="/services" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                        Services
                    </NavLink>
                )}

                {/* Access to Admin Panel only for Project Manager */}
                {user.mainRole === "ProjectManager" && (
                    <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                        Project Management
                    </NavLink>
                )}

                {/* Access to Dashboard only for Worker */}
                {user.mainRole === "Worker" && (
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                        My Tasks
                    </NavLink>
                )}
            </nav>

            <div className="right-section">
                <ProfileMenu />
            </div>
        </header>
    );
}