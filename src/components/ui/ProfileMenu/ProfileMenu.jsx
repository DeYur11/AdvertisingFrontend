import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../store/userSlice";
import "./ProfileMenu.css";

export default function ProfileMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector(state => state.user);

    function handleLogout() {
        dispatch(logout());
        navigate("/login");
    }

    function handleSettings() {
        navigate("/settings");
        setIsMenuOpen(false);
    }

    function toggleMenu() {
        setIsMenuOpen(prev => !prev);
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!user.name) return null; // If not logged in - don't show avatar

    return (
        <div className="profile-wrapper" ref={menuRef}>
            <div
                className={`profile ${isMenuOpen ? "active" : ""}`}
                onClick={toggleMenu}
                aria-label="User profile menu"
                aria-expanded={isMenuOpen}
            >
                {user.name[0]}
            </div>

            <div className={`dropdown-menu ${isMenuOpen ? "show" : ""}`}>
                <div className="user-info">
                    <div className="user-name">{user.name} {user.surname}</div>
                    <div className="user-role">
                        {user.mainRole}
                        {user.isReviewer && " + Reviewer"}
                    </div>
                </div>
                <button onClick={handleSettings}>⚙️ Settings</button>
                <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
            </div>
        </div>
    );
}