import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Header from "./component/Header/Header";
import Login from "./component/Login/Login";
import Settings from "./page/Settings/Settings";

function Home() {
    return <h2>Home Page</h2>;
}

function About() {
    return <h2>About Page</h2>;
}

function Services() {
    return <h2>Services Page</h2>;
}

function AdminPanel() {
    return <h2>Admin Panel</h2>;
}

export default function App() {
    const [role, setRole] = useState(null); // Спочатку користувач не залогінений

    return (
        <Router>
            {role && <Header role={role} setRole={setRole} />}
            <main>
                <Routes>
                    {!role && <Route path="*" element={<Login setRole={setRole} />} />}
                    {role && (
                        <>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/services" element={<Services />} />
                            <Route path="/admin" element={<AdminPanel />} />
                            <Route path="/settings" element={<Settings />} />
                        </>
                    )}
                </Routes>
            </main>
        </Router>
    );
}
