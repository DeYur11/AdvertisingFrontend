export default function TaskFilterBar({ taskFilter, setTaskFilter, searchQuery, setSearchQuery }) {
    return (
        <div className="task-filter-bar">
            <button
                className={`filter-button ${taskFilter === "active" ? "active" : ""}`}
                onClick={() => setTaskFilter("active")}
            >
                Active Tasks
            </button>
            <button
                className={`filter-button ${taskFilter === "all" ? "active" : ""}`}
                onClick={() => setTaskFilter("all")}
            >
                All Tasks
            </button>

            <input
                type="text"
                className="search-input"
                placeholder="Search by project, service, or task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    );
}
