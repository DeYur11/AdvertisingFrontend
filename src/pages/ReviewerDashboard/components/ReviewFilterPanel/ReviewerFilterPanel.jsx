import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import "./ReviewerFilterPanel.css";
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import Card from "../../../../components/common/Card/Card";
// Import queries from the new file
import { GET_FILTER_REFERENCE_DATA } from "../../graphql/reviewerQueries";

export default function ReviewerFilterPanel({
                                                searchQuery,
                                                setSearchQuery,
                                                filters = {},
                                                setFilters,
                                                expanded,
                                                setExpanded,
                                                onSortChange,
                                                currentSortField = "createDatetime",
                                                currentSortDirection = "DESC"
                                            }) {
    // Fetch reference data from database
    const { data: refData, loading } = useQuery(GET_FILTER_REFERENCE_DATA);

    // Local state for filter values
    const [activeFilterCount, setActiveFilterCount] = useState(0);

    // Update active filter count when filters change
    useEffect(() => {
        let count = 0;
        Object.keys(filters).forEach(key => {
            if (Array.isArray(filters[key]) && filters[key].length > 0) count++;
            else if (typeof filters[key] === 'object' && filters[key] !== null) count++;
            else if (filters[key]) count++;
        });

        setActiveFilterCount(count);
    }, [filters]);

    // Handle applying filter changes
    const applyFilter = (filterType, value) => {
        const newFilters = { ...filters };

        // Handle array-type filters (checkboxes, multiselect)
        if (Array.isArray(value)) {
            if (value.length === 0) {
                delete newFilters[filterType];
            } else {
                newFilters[filterType] = value;
            }
        }
        // Handle date ranges
        else if (filterType === 'dateRange') {
            if (!value.from && !value.to) {
                delete newFilters[filterType];
            } else {
                newFilters[filterType] = value;
            }
        }
        // Handle regular single-value filters
        else {
            if (!value) {
                delete newFilters[filterType];
            } else {
                newFilters[filterType] = value;
            }
        }

        setFilters(newFilters);
    };

    // Handle changes to multi-select options
    const handleOptionToggle = (filterType, optionValue) => {
        const currentValues = filters[filterType] || [];
        let newValues;

        if (currentValues.includes(optionValue)) {
            newValues = currentValues.filter(v => v !== optionValue);
        } else {
            newValues = [...currentValues, optionValue];
        }

        applyFilter(filterType, newValues);
    };

    // Handle changes to date ranges
    const handleDateChange = (type, value) => {
        const currentDateRange = filters.dateRange || {};
        applyFilter('dateRange', {
            ...currentDateRange,
            [type]: value
        });
    };

    // Reset all filters
    const handleResetFilters = () => {
        setFilters({});
        setSearchQuery("");
    };

    // Helper to apply quick date filters
    const applyQuickDateFilter = (days) => {
        const today = new Date();
        const targetDate = new Date();

        if (days === 'today') {
            applyFilter('dateRange', {
                from: today.toISOString().split('T')[0],
                to: today.toISOString().split('T')[0]
            });
        } else if (days === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            applyFilter('dateRange', {
                from: weekAgo.toISOString().split('T')[0],
                to: today.toISOString().split('T')[0]
            });
        } else {
            // For future dates, we set date range
            targetDate.setDate(today.getDate() + days);
            applyFilter('dateRange', {
                from: today.toISOString().split('T')[0],
                to: targetDate.toISOString().split('T')[0]
            });
        }
    };

    // Handle sort change
    const handleSortChange = (field) => {
        // If clicking the same field, toggle direction
        if (field === currentSortField) {
            onSortChange(field, currentSortDirection === "ASC" ? "DESC" : "ASC");
        } else {
            // New field, default to DESC for createDatetime, ASC for others
            const defaultDirection = field === "createDatetime" ? "DESC" : "ASC";
            onSortChange(field, defaultDirection);
        }
    };

    // Render sort indicator based on current sort state
    const renderSortIndicator = (field) => {
        if (field !== currentSortField) return null;

        return (
            <span className="sort-indicator">
                {currentSortDirection === "ASC" ? "↑" : "↓"}
            </span>
        );
    };

    return (
        <div className="reviewer-filter-panel-container">
            {/* Search and Basic Filters Bar */}
            <div className="filter-bar">
                <div className="filter-actions">
                    <div className="review-status-tabs">
                        <Button
                            variant={!filters.reviewStatus || filters.reviewStatus === "all" ? "primary" : "outline"}
                            size="small"
                            onClick={() => applyFilter('reviewStatus', 'all')}
                            className="filter-button"
                        >
                            All Materials
                        </Button>
                        <Button
                            variant={filters.reviewStatus === "pending" ? "primary" : "outline"}
                            size="small"
                            onClick={() => applyFilter('reviewStatus', 'pending')}
                            className="filter-button"
                        >
                            Pending Review
                        </Button>
                        <Button
                            variant={filters.reviewStatus === "reviewed" ? "primary" : "outline"}
                            size="small"
                            onClick={() => applyFilter('reviewStatus', 'reviewed')}
                            className="filter-button"
                        >
                            Reviewed by Me
                        </Button>
                    </div>

                    <Button
                        variant={expanded ? "primary" : "outline"}
                        size="small"
                        icon={expanded ? "🔽" : "🔍"}
                        className={`advanced-filter-button ${activeFilterCount > 0 ? 'has-active-filters' : ''}`}
                        onClick={() => setExpanded(!expanded)}
                    >
                        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </Button>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search materials by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search materials"
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

                {/* Sort Controls */}
                <div className="sort-controls">
                    <span className="sort-label">Sort by:</span>
                    <div className="sort-options">
                        <button
                            className={`sort-option ${currentSortField === "name" ? "active" : ""}`}
                            onClick={() => handleSortChange("name")}
                        >
                            Name {renderSortIndicator("name")}
                        </button>
                        <button
                            className={`sort-option ${currentSortField === "createDatetime" ? "active" : ""}`}
                            onClick={() => handleSortChange("createDatetime")}
                        >
                            Creation Date {renderSortIndicator("createDatetime")}
                        </button>
                        <button
                            className={`sort-option ${currentSortField === "status" ? "active" : ""}`}
                            onClick={() => handleSortChange("status")}
                        >
                            Status {renderSortIndicator("status")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="active-filters-display">
                    <div className="active-filters-label">Active Filters:</div>
                    <div className="active-filters-list">
                        {filters.status?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Status:</span>
                                <span className="filter-value">
                                    {filters.status.length} selected
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('status', [])}
                                    aria-label="Remove status filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.type?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Material Type:</span>
                                <span className="filter-value">
                                    {filters.type.length} selected
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('type', [])}
                                    aria-label="Remove material type filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.language?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Language:</span>
                                <span className="filter-value">
                                    {filters.language.length} selected
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('language', [])}
                                    aria-label="Remove language filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.dateRange && (
                            <div className="active-filter">
                                <span className="filter-name">Date Range:</span>
                                <span className="filter-value">
                                    {filters.dateRange.from &&
                                        `From: ${new Date(filters.dateRange.from).toLocaleDateString()}`}
                                    {filters.dateRange.from && filters.dateRange.to && ' - '}
                                    {filters.dateRange.to &&
                                        `To: ${new Date(filters.dateRange.to).toLocaleDateString()}`}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('dateRange', {})}
                                    aria-label="Remove date filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.reviewStatus && filters.reviewStatus !== 'all' && (
                            <div className="active-filter">
                                <span className="filter-name">Review Status:</span>
                                <span className="filter-value">
                                    {filters.reviewStatus === 'pending' ? 'Pending Review' : 'Reviewed by Me'}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('reviewStatus', 'all')}
                                    aria-label="Remove review status filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="small"
                        className="clear-filters-btn"
                        onClick={handleResetFilters}
                    >
                        Clear All
                    </Button>
                </div>
            )}

            {/* Advanced Filters Collapsible Panel */}
            {expanded && (
                <Card className="advanced-filters-panel">
                    <div className="filters-content">
                        {loading ? (
                            <div className="loading-filters">Loading filter options...</div>
                        ) : (
                            <>
                                {/* Material Status Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Material Status</h3>
                                    <div className="filter-chips">
                                        {refData?.materialStatuses.map(status => (
                                            <div
                                                key={status.id}
                                                className={`filter-chip ${(filters.status || []).includes(status.id) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('status', status.id)}
                                            >
                                                {status.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Material Type Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Material Type</h3>
                                    <div className="filter-chips">
                                        {refData?.materialTypes.map(type => (
                                            <div
                                                key={type.id}
                                                className={`filter-chip ${(filters.type || []).includes(type.id) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('type', type.id)}
                                            >
                                                {type.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Language Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Language</h3>
                                    <div className="filter-chips">
                                        {refData?.languages.map(language => (
                                            <div
                                                key={language.id}
                                                className={`filter-chip ${(filters.language || []).includes(language.id) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('language', language.id)}
                                            >
                                                {language.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Creation Date</h3>
                                    <div className="date-filter-grid">
                                        <div className="date-inputs">
                                            <div className="date-range-input">
                                                <label>From:</label>
                                                <input
                                                    type="date"
                                                    value={filters.dateRange?.from || ""}
                                                    onChange={(e) => handleDateChange("from", e.target.value)}
                                                />
                                            </div>
                                            <div className="date-range-input">
                                                <label>To:</label>
                                                <input
                                                    type="date"
                                                    value={filters.dateRange?.to || ""}
                                                    onChange={(e) => handleDateChange("to", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="quick-date-filters">
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => applyQuickDateFilter('today')}
                                            >
                                                Today
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => applyQuickDateFilter('week')}
                                            >
                                                Last 7 Days
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => applyQuickDateFilter(30)}
                                            >
                                                Next 30 Days
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}