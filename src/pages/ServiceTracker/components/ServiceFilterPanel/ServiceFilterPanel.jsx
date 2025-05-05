import Button from "../../../../components/common/Button/Button";
import "./ServiceFilterPanel.css";

export default function ServiceFilterPanel({ filters, setFilters, onRefresh }) {
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    };

    const handleFilterToggle = (e) => {
        setFilters(prev => ({ ...prev, onlyMismatched: e.target.checked }));
    };

    const handleGroupToggle = (e) => {
        setFilters(prev => ({ ...prev, groupByProject: e.target.checked }));
    };

    return (
        <div className="filter-bar">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by service, project, or client name..."
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                {filters.searchQuery && (
                    <button
                        className="clear-search"
                        onClick={() => setFilters(prev => ({ ...prev, searchQuery: "" }))}
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="filter-options">
                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={filters.onlyMismatched}
                        onChange={handleFilterToggle}
                    />
                    <span>Show only pending services</span>
                </label>

                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={filters.groupByProject}
                        onChange={handleGroupToggle}
                    />
                    <span>Group by project</span>
                </label>
            </div>

            <Button
                variant="outline"
                size="small"
                onClick={onRefresh}
                icon="↻"
            >
                Refresh
            </Button>
        </div>
    );
}