// src/components/layout/Sidebar/Sidebar.jsx
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import CloseIcon from "@mui/icons-material/Close";

export default function Sidebar({ isOpen, onClose, navLinks }) {
    return (
        <>
            {/* Backdrop for closing when clicking outside */}
            <div
                className={`sidebar-backdrop ${isOpen ? "active" : ""}`}
                onClick={onClose}
            ></div>

            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <span className="sidebar-title">Navigation</span>
                    <button
                        className="sidebar-close-button"
                        onClick={onClose}
                        aria-label="Close navigation menu"
                    >
                        <CloseIcon className="close-icon" />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                isActive ? "sidebar-link active" : "sidebar-link"
                            }
                            onClick={onClose}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    );
}