import { useState, useEffect } from "react";
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [redirectMessage, setRedirectMessage] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();

    async function handleLogin(event) {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await axios.post("http://192.168.0.197:8080/auth/login", { username, password });
            const token = response.data.token;

            // Зберігаємо токен
            localStorage.setItem("token", token);

            // Декодуємо токен
            const decoded = jwtDecode(token);

            dispatch(storeLogin({
                username: decoded.username,
                name: decoded.name,
                surname: decoded.surname,
                mainRole: decoded.role,
                isReviewer: decoded.isReviewer,
                workerId: parseInt(decoded.sub),
                token
            }));

            toast.success("Успішний вхід!", {
                autoClose: 850
            });

            setLoginSuccess(true);

            // Redirect based on user role
            const role = decoded.role;
            if (role === "WORKER") {
                setRedirectMessage("Перенаправлення на сторінку Завдань...");
                setTimeout(() => navigate("/dashboard"), 1500); // Worker goes to tasks
            } else if (role === "PROJECT_MANAGER") {
                setRedirectMessage("Перенаправлення на Проектний Менеджмент...");
                setTimeout(() => navigate("/projects"), 1500); // Project manager goes to project management
            } else if (role === "SCRUM_MASTER") {
                setRedirectMessage("Перенаправлення на Призначення Сервісів...");
                setTimeout(() => navigate("/service-tracker"), 1500); // Scrum master goes to service assignment
            } else {
                setRedirectMessage("Перенаправлення на Головну...");
                setTimeout(() => navigate("/"), 1500); // Default redirect to home
            }
        } catch (error) {
            console.error("Login error:", error);

            // Provide more specific error messages
            if (error.response) {
                // Server responded with error status
                if (error.response.status === 401) {
                    setError("Невірний логін або пароль");
                } else if (error.response.status === 403) {
                    setError("Доступ заборонено");
                } else {
                    setError(`Помилка сервера: ${error.response.status}`);
                }
            } else if (error.request) {
                // No response received
                setError("Сервер не відповідає. Перевірте з'єднання.");
            } else {
                // Other error
                setError("Невірні дані або сервер недоступний");
            }

            toast.error("Помилка входу");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="company-logo">AdManager</div>
            <h2>Вхід у систему</h2>

            {loginSuccess ? (
                <div className="success-message">
                    <div className="success-icon">✓</div>
                    <h3>Вхід виконано успішно!</h3>
                    <p>{redirectMessage}</p>
                    <div className="loader"></div>
                </div>
            ) : (
                <form onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="username">Імʼя користувача</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Введіть логін"
                            required
                            autoComplete="username"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Завантаження..." : "Увійти"}
                    </button>
                </form>
            )}

            <div className="form-footer">
                © {new Date().getFullYear()} AdManager. Всі права захищено.
            </div>
        </div>
    );
}