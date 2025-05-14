import { useState } from "react";
import { useSelector } from "react-redux";
import TaskList from "./components/TaskList/TaskList";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import ExportDataModal from "./components/ExportDataModal/ExportDataModal";
import "./WorkerTasks.css";

export default function WorkerTasks() {
    const user = useSelector(state => state.user);
    const [exportModalOpen, setExportModalOpen] = useState(false);

    // State for pagination and filtering
    const [pageState, setPageState] = useState({
        page: 0,           // 0-based page number (first page is 0)
        size: 10,          // Items per page
        sortField: "DEADLINE",
        sortDirection: "ASC",
        filter: {          // Initial empty filter
            nameContains: "",
            statusIds: [],
            priorityIn: [],
            deadlineFrom: null,
            deadlineTo: null
        }
    });

    // Function to update pagination state
    const updatePageState = (newState) => {
        setPageState(prev => ({
            ...prev,
            ...newState
        }));
    };

    // Function to update filter state
    const updateFilterState = (filterUpdates) => {
        setPageState(prev => ({
            ...prev,
            // Reset to first page when filters change
            page: 0,
            filter: {
                ...prev.filter,
                ...filterUpdates
            }
        }));
    };
    // TODO Зробити так щоб не можна було додавати матеріали до завдання що ще не почалось
    // Function to handle search query changes
    const handleSearchChange = (query) => {
        updateFilterState({ nameContains: query });
    };

    // Function to clear all filters
    const clearAllFilters = () => {
        setPageState(prev => ({
            ...prev,
            page: 0,
            filter: {
                nameContains: "",
                statusIds: [],
                priorityIn: [],
                deadlineFrom: null,
                deadlineTo: null
            }
        }));
    };

    // Check if user is a Worker
    if (user.mainRole !== "WORKER") {
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
                    <h2>Вітаю, {user.name} {user.surname}</h2>
                    {user.isReviewer && <div className="user-role">Worker + Reviewer</div>}
                </div>
                <div className="dashboard-actions">
                    <Button
                        variant="outline"
                        size="medium"
                        icon="📊"
                        onClick={() => setExportModalOpen(true)}
                    >
                        Експорт даних
                    </Button>
                </div>
            </div>

            <div className="dashboard-content">
                <h3>Ваші завдання</h3>
                <TaskList
                    pageState={pageState}
                    updatePageState={updatePageState}
                    updateFilterState={updateFilterState}
                    handleSearchChange={handleSearchChange}
                    clearAllFilters={clearAllFilters}
                />
            </div>

            {/* Модальне вікно експорту даних */}
            <ExportDataModal
                isOpen={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
                workerId={user.workerId}
                filter={pageState.filter}
                currentSortField={pageState.sortField}
                currentSortDirection={pageState.sortDirection}
            />
        </div>
    );
}