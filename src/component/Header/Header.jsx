import { NavLink } from "react-router-dom";
import ProfileMenu from "./../ProfileMenu/ProfileMenu";
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
                <NavLink to="/public" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                    Home
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                    About
                </NavLink>

                {/* Доступ до Services для Project Manager або Scrum Master */}
                {(user.mainRole === "ProjectManager" || user.mainRole === "ScrumMaster") && (
                    <NavLink to="/services" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                        Services
                    </NavLink>
                )}

                {/* Доступ до Admin Panel тільки для Project Manager */}
                {user.mainRole === "ProjectManager" && (
                    <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                        Admin Panel
                    </NavLink>
                )}

                {/* Доступ до Dashboard тільки для Worker */}
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
