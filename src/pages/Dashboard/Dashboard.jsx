import React, { useState } from "react"; // Додано useState
import { useSelector } from "react-redux";
import TaskList from "./components/TaskList/TaskList";
import TaskFilterPanel from "./components/TaskFilterPanel/TaskFilterPanel"; // Шлях може потребувати коригування
import Card from "../../components/common/Card/Card";
import "./Dashboard.css";

export default function Dashboard() {
    const user = useSelector(state => state.user);

    // --- Стан фільтрів перенесено сюди ---
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);
    const [sortField, setSortField] = useState("DEADLINE"); // Зберігаємо початкове сортування
    const [sortDirection, setSortDirection] = useState("ASC"); // Зберігаємо початкове сортування
    const [taskFilter, setTaskFilter] = useState("active"); // Стан для "Active"/"All" фільтра

    // --- Кінець стану фільтрів ---

    if (user.mainRole !== "Worker") {
        return (
            <div className="dashboard-container">
                <Card className="access-denied">
                    <div className="access-denied-icon">⚠️</div>
                    <h2>Access Denied</h2>
                    <p>This page is only accessible to Workers.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="user-welcome">
                    <h2>Welcome, {user.name} {user.surname}</h2>
                    {user.isReviewer && <div className="user-role">Worker + Reviewer</div>}
                </div>
                <div className="dashboard-actions">
                    {/* Future actions buttons can go here */}
                </div>
            </div>

            <div className="dashboard-content">
                <h3>Your Tasks</h3>

                {/* --- TaskFilterPanel тепер рендериться тут --- */}
                <TaskFilterPanel
                    taskFilter={taskFilter}          // Передаємо стан
                    setTaskFilter={setTaskFilter}    // Передаємо функцію оновлення
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filters={filters}
                    setFilters={setFilters}
                    expanded={filterPanelExpanded}
                    setExpanded={setFilterPanelExpanded}
                    onSortChange={(field, direction) => { // Обробник зміни сортування
                        setSortField(field);
                        setSortDirection(direction);
                    }}
                    currentSortField={sortField}      // Поточне поле сортування
                    currentSortDirection={sortDirection} // Поточний напрямок сортування
                />
                {/* --- Кінець TaskFilterPanel --- */}

                {/* --- TaskList отримує стан фільтрів як пропси --- */}
                <TaskList
                    searchQuery={searchQuery}
                    filters={filters}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    // taskFilter={taskFilter} // Передаємо, якщо TaskList його потребує для запиту
                />
                {/* --- Кінець TaskList --- */}
            </div>
        </div>
    );
}