// src/components/layout/Header/Header.jsx
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery, gql } from "@apollo/client";
import ProfileMenu from "../../ui/ProfileMenu/ProfileMenu";
import NotificationBell from "../../ui/NotificationBell/NotificationBell";
import NotificationSidebar from "../../ui/NotificationSidebar/NotificationSidebar";
import Sidebar from "../Sidebar/Sidebar";
import MenuIcon from "@mui/icons-material/Menu";
import "./Header.css";

/* ───── GraphQL: ID-переліки для кожної ролі ───── */

/* WORKER → матеріали, які він створив / яким призначений */
const GET_WORKER_MATERIAL_IDS = gql`
    query GetWorkerMaterials($workerId: ID!) {
        materialsByWorker(workerId: $workerId) { id }
    }
`;

/* SCRUM_MASTER → завдання, за які він відповідає
   (припустимо бек має такий запит; заміни на свій) */
const GET_SCRUM_TASK_IDS = gql`
    query GetScrumTasks {
        activeProjectTasks {
            id
        }
    }
`;

/* PROJECT_MANAGER → проєкти, де він менеджер */
const GET_PM_PROJECT_IDS = gql`
    query GetManagerProjects($managerId: ID!) {
        projectsByManager(managerId: $managerId) { id }
    }
`;

export default function Header() {
    const user = useSelector((s) => s.user);

    /* ────────── локальний стан ────────── */
    const [materialIds, setMaterialIds] = useState([]);
    const [taskIds, setTaskIds] = useState([]);
    const [projectIds, setProjectIds] = useState([]);

    const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
    const [navigationSidebarOpen, setNavigationSidebarOpen] = useState(false);

    const role = user.mainRole;
    const isWorker = role === "WORKER";
    const isScrum = role === "SCRUM_MASTER";
    const isPm = role === "PROJECT_MANAGER";

    /* ────────── запити ідентифікаторів ────────── */

    const { data: matData } = useQuery(GET_WORKER_MATERIAL_IDS, {
        variables: { workerId: user.workerId },
        skip: !isWorker || !user.workerId
    });

    const { data: taskData } = useQuery(GET_SCRUM_TASK_IDS, {
        skip: !isScrum,
        onCompleted: (data) => {
            console.log("Отримані завдання:", data);
            setTaskIds(data.activeProjectTasks.map(t => +t.id));
        }
    });

    const { data: projData } = useQuery(GET_PM_PROJECT_IDS, {
        variables: { managerId: user.workerId },
        skip: !isPm || !user.workerId
    });

    /* оновлюємо стани, коли приходять дані */
    useEffect(() => {
        if (matData?.materialsByWorker) {
            setMaterialIds(matData.materialsByWorker.map(m => +m.id));
        }
    }, [matData]);

    useEffect(() => {
        if (projData?.projectsByManager) {
            setProjectIds(projData.projectsByManager.map(p => +p.id));
        }
    }, [projData]);

// окремий useEffect для логування taskIds після оновлення
    useEffect(() => {
        console.log("Нові taskIds:", taskIds);
    }, [taskIds]);

    /* ────────── обробники ────────── */
    const toggleNotificationSidebar = () =>
        setNotificationSidebarOpen(o => !o);
    const toggleNavigationSidebar = () =>
        setNavigationSidebarOpen(o => !o);

    /* ────────── менеджерське меню ────────── */
    const managerNavLinks = [
        { to: "/", label: "Home" },
        { to: "/projects", label: "Проектний менеджмент" },
        { to: "/service-tracker", label: "Призначення сервісів" },
        { to: "/employee-management", label: "Менеджмент" },
        { to: "/service-dashboard", label: "Огляд сервісів" },
        { to: "/reviewer", label: "Рецензування" }
    ];

    /* ────────── UI ────────── */
    return (
        <>
            <header className="header">

                {/* ███ left ███ */}
                <div className="left-section">
                    {isPm ? (
                        <button
                            className="burger-menu-button"
                            onClick={toggleNavigationSidebar}
                        >
                            <MenuIcon />
                        </button>
                    ) : (
                        <div className="logo">AdManager</div>
                    )}
                </div>

                {/* ███ center (для PM) ███ */}
                {isPm && (
                    <div className="center-section">
                        <div className="logo">AdManager</div>
                    </div>
                )}

                {/* ███ nav (для SCRUM/WORKER) ███ */}
                {!isPm && (
                    <nav className="nav">
                        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                            Home
                        </NavLink>

                        {isScrum && (
                            <NavLink to="/service-tracker" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                Service Tracker
                            </NavLink>
                        )}

                        {isWorker && (
                            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                My Tasks
                            </NavLink>
                        )}

                        {user.isReviewer && (
                            <NavLink to="/reviewer" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
                                Review Materials
                            </NavLink>
                        )}
                    </nav>
                )}

                {/* ███ right ███ */}
                <div className="right-section">
                    <NotificationBell
                        materialIds={materialIds}
                        taskIds={taskIds}
                        projectIds={projectIds}
                        onToggleSidebar={toggleNotificationSidebar}
                    />
                    <ProfileMenu />
                </div>
            </header>

            {/* менеджерська навігація */}
            <Sidebar
                isOpen={navigationSidebarOpen}
                onClose={() => setNavigationSidebarOpen(false)}
                navLinks={managerNavLinks}
            />

            {/* сайдбар сповіщень */}
            <NotificationSidebar
                isOpen={notificationSidebarOpen}
                onClose={() => setNotificationSidebarOpen(false)}
                materialIds={materialIds}
                taskIds={taskIds}
                projectIds={projectIds}
            />
        </>
    );
}