import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Header.css";

export default function Header({ role, setRole }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function handleLogout() {
        setRole(null);
        navigate("/login");
    }

    function handleSettings() {
        navigate("/settings");
        setIsMenuOpen(false);
    }

    function toggleMenu() {
        setIsMenuOpen(prev => !prev);
    }

    return (
        <header className="header">
            <div className="left-section">
                <div className="logo">AdManager</div>
            </div>

            <nav className="nav">
                <Link to="/public" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>

                {(role === "Admin" || role === "Manager") && (
                    <Link to="/services" className="nav-link">Services</Link>
                )}
                {role === "Admin" && (
                    <Link to="/admin" className="nav-link">Admin Panel</Link>
                )}
            </nav>

            <div className="right-section">
                <div className="profile-wrapper">
                    <div className="profile" onClick={toggleMenu}>
                        {role[0]}
                    </div>

                    {isMenuOpen && (
                        <div className="dropdown-menu">
                            <button onClick={handleSettings}>Settings</button>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
