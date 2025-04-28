import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ setRole }) {
    const [selectedRole, setSelectedRole] = useState("User");
    const navigate = useNavigate();

    function handleLogin(event) {
        event.preventDefault();
        setRole(selectedRole);
        navigate("/"); // Переходимо на головну
    }

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>Select your role:</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                </select>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
