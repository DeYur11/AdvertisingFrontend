import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../store/userSlice";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login() {
    const [selectedRole, setSelectedRole] = useState("Worker");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [isReviewer, setIsReviewer] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    function handleLogin(event) {
        event.preventDefault();

        dispatch(login({
            name: name || "John",
            surname: surname || "Doe",
            mainRole: selectedRole,
            isReviewer: selectedRole === "ProjectManager" ? true : isReviewer
        }));

        toast.success("Successfully logged in! 🚀");
        navigate("/");
    }

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>First Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter first name"
                />

                <label>Last Name:</label>
                <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Enter last name"
                />

                <label>Select your main role:</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                    <option value="ProjectManager">Project Manager</option>
                    <option value="ScrumMaster">Scrum Master</option>
                    <option value="Worker">Worker</option>
                </select>

                {/* Якщо Worker — показуємо чекбокс для вибору рецензента */}
                {selectedRole === "Worker" && (
                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={isReviewer}
                            onChange={(e) => setIsReviewer(e.target.checked)}
                        />
                        <label>I am also a Reviewer</label>
                    </div>
                )}

                <button type="submit">Login</button>
            </form>
        </div>
    );
}
