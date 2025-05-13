// src/pages/EmployeeManagement/components/ClientManagement/ClientFilterPanel.jsx// src/pages/EmployeeManagement/components/ClientManagement/ClientFilterPanel.jsx
import { useState, useEffect } from "react";
import Button from "../../../../components/common/Button/Button";
import "./ClientFilterPanel.css";

export default function ClientFilterPanel({
                                              searchQuery,
                                              setSearchQuery,
                                              filters = {},
                                              setFilters
                                          }) {
    const [expanded, setExpanded] = useState(false);
    const [activeFilterCount, setActiveFilterCount] = useState(0);

    // Update active filter count
    useEffect(() => {
        let count = 0;
        if (searchQuery) count++;
        setActiveFilterCount(count);
    }, [searchQuery, filters]);

    // Reset all filters
    const handleResetFilters = () => {
        setFilters({});
        setSearchQuery("");
    };

    return (
        <div className="client-filter-panel">
            <div className="filter-panel-header">
                <div className="search-bar">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="text"
                            placeholder="Пошук клієнтів за назвою або email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="clear-search"
                                onClick={() => setSearchQuery("")}
                            >
                                ×
                            </button>
                        )}
                    </form>
                </div>

                <div className="filter-actions">
                    {activeFilterCount > 0 && (
                        <Button
                            variant="outline"
                            size="small"
                            onClick={handleResetFilters}
                        >
                            Скинути фільтри
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}