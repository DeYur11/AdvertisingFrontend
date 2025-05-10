import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as storeLogin } from "../../store/userSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Login.css";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();

    async function handleLogin(event) {
        event.preventDefault();

        try {
            const response = await axios.post("http://localhost:8080/auth/login", { username, password });
            const token = response.data.token;

            // Зберігаємо токен
            localStorage.setItem("token", token);

            // Декодуємо токен
            const decoded = jwtDecode(token);

            dispatch(storeLogin({
                username: decoded.username,
                name: decoded.name,         // 👈
                surname: decoded.surname,   // 👈
                mainRole: decoded.role,     // 👈
                isReviewer: decoded.isReviewer,
                workerId: parseInt(decoded.sub),
                token
            }));

            toast.success("Успішний вхід!", {
                autoClose: 850 // 2 секунди
            });

            navigate("/");
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Невірні дані або сервер недоступний");
        }
    }

    return (
        <div className="login-container">
            <h2>Вхід у систему</h2>
            <form onSubmit={handleLogin}>
                <label>Імʼя користувача</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    required
                />

                <label>Пароль</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />

                <button type="submit">Увійти</button>
            </form>
        </div>
    );
}
