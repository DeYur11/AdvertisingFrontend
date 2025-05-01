import Button from "../../../../components/common/Button/Button";
import "./TaskFilterBar.css";

export default function TaskFilterBar({ taskFilter, setTaskFilter, searchQuery, setSearchQuery }) {
    return (
        <div className="task-filter-bar">
            <div className="filter-buttons">
                <Button
                    variant={taskFilter === "active" ? "primary" : "outline"}
                    size="small"
                    onClick={() => setTaskFilter("active")}
                    className="filter-button"
                >
                    Active Tasks
                </Button>
                <Button
                    variant={taskFilter === "all" ? "primary" : "outline"}
                    size="small"
                    onClick={() => setTaskFilter("all")}
                    className="filter-button"
                >
                    All Tasks
                </Button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by project, service, or task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search tasks"
                />
                {searchQuery && (
                    <button
                        className="clear-search"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
                <span className="search-icon">🔍</span>
            </div>
        </div>
    );
}