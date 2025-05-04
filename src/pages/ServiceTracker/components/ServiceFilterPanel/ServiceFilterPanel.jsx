// src/pages/ServiceTracker/components/ServiceFilterPanel/ServiceFilterPanel.jsx
import "./ServiceFilterPanel.css";

export default function ServiceFilterPanel({ filters, setFilters }) {
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    };

    const handleFilterToggle = (e) => {
        setFilters(prev => ({ ...prev, onlyMismatched: e.target.checked }));
    };

    return (
        <div className="filter-bar">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by service or project name..."
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
                    <span>Show only services with missing implementations</span>
                </label>
            </div>
        </div>
    );
}