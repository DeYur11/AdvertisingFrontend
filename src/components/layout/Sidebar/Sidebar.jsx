import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import CloseIcon from "@mui/icons-material/Close";

export default function Sidebar({ isOpen, onClose, navLinks }) {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-header">
                <span>Navigation</span>
                <CloseIcon className="close-icon" onClick={onClose} />
            </div>
            <nav className="sidebar-nav">
                {navLinks.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                        onClick={onClose}
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
