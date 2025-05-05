import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import "./TaskFilterPanel.css";

// GraphQL query for reference data
const GET_FILTER_REFERENCE_DATA = gql`
    query GetFilterReferenceData {
        projectTypes {
            id
            name
        }
        projectStatuses {
            id
            name
        }
        serviceTypes {
            id
            name
        }
        taskStatuses {
            id
            name
        }
        clients {
            id
            name
        }
    }
`;

export default function TaskFilterPanel({
                                            viewMode,
                                            onViewModeChange,
                                            searchQuery,
                                            onSearchChange,
                                            filters = {},
                                            onFiltersChange,
                                            expanded,
                                            setExpanded,
                                            onSortChange,
                                            currentSortField,
                                            currentSortDirection,
                                            onClearAllFilters
                                        }) {
    // Fetch reference data
    const { data: refData, loading } = useQuery(GET_FILTER_REFERENCE_DATA);

    // Local state for tracking active filters count and client search
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const [clientSearchQuery, setClientSearchQuery] = useState("");

    // Update active filter count when filters change
    useEffect(() => {
        let count = 0;

        // Count statusIds
        if (filters.statusIds?.length > 0) count++;

        // Count priorityIn
        if (filters.priorityIn?.length > 0) count++;

        // Count deadline date range
        if (filters.deadlineFrom || filters.deadlineTo) count++;

        // Count nameContains (search)
        if (filters.nameContains) count++;

        // Count serviceInProgressIds
        if (filters.serviceInProgressIds?.length > 0) count++;

        // Count other date ranges
        if (filters.startDateFrom || filters.startDateTo) count++;
        if (filters.endDateFrom || filters.endDateTo) count++;
        if (filters.createdFrom || filters.createdTo) count++;

        setActiveFilterCount(count);
    }, [filters]);

    // Handle filter changes
    const applyFilter = (key, value) => {
        // Create a new filter object
        const updatedFilters = { ...filters };

        // Handle array type filters
        if (Array.isArray(value)) {
            if (value.length === 0) {
                delete updatedFilters[key];
            } else {
                updatedFilters[key] = value;
            }
        }
        // Handle date ranges
        else if (
            key === 'deadlineFrom' || key === 'deadlineTo' ||
            key === 'startDateFrom' || key === 'startDateTo' ||
            key === 'endDateFrom' || key === 'endDateTo' ||
            key === 'createdFrom' || key === 'createdTo'
        ) {
            if (!value) {
                delete updatedFilters[key];
            } else {
                updatedFilters[key] = value;
            }
        }
        // Handle simple value filters
        else {
            if (!value && value !== 0) {
                delete updatedFilters[key];
            } else {
                updatedFilters[key] = value;
            }
        }

        onFiltersChange(updatedFilters);
    };

    // Handle toggling a status ID in the filter
    const handleStatusToggle = (statusId) => {
        const currentStatusIds = filters.statusIds || [];
        let newStatusIds;

        if (currentStatusIds.includes(statusId)) {
            newStatusIds = currentStatusIds.filter(id => id !== statusId);
        } else {
            newStatusIds = [...currentStatusIds, statusId];
        }

        applyFilter('statusIds', newStatusIds);
    };

    // Handle toggling a priority value in the filter
    const handlePriorityToggle = (priorityLevel) => {
        const currentPriorities = filters.priorityIn || [];
        let newPriorities;

        // Map priority levels to actual priority values
        const priorityRanges = {
            "high": [8, 9, 10],
            "medium": [4, 5, 6, 7],
            "low": [1, 2, 3]
        };

        const allPriorities = priorityRanges[priorityLevel] || [];

        // Check if all the priorities in this level are already selected
        const allSelected = allPriorities.every(p => currentPriorities.includes(p));

        if (allSelected) {
            // If all are selected, remove them all
            newPriorities = currentPriorities.filter(p => !allPriorities.includes(p));
        } else {
            // If not all selected, add the missing ones
            newPriorities = [
                ...currentPriorities.filter(p => !allPriorities.includes(p)),
                ...allPriorities
            ];
        }

        applyFilter('priorityIn', newPriorities);
    };

    // Handle deadline date changes
    const handleDateChange = (type, value) => {
        applyFilter(type, value);
    };

    // Apply quick date filters
    const applyQuickDateFilter = (days) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        if (days === 'overdue') {
            // For overdue, set deadlineTo as today
            applyFilter('deadlineTo', todayStr);
            applyFilter('deadlineFrom', null);
        } else {
            // For future dates
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + days);
            const targetStr = targetDate.toISOString().split('T')[0];

            applyFilter('deadlineFrom', todayStr);
            applyFilter('deadlineTo', targetStr);
        }
    };

    // Handle sort changes
    const handleSortChange = (field) => {
        if (field === currentSortField) {
            // Toggle direction if clicking the same field
            onSortChange(field, currentSortDirection === "ASC" ? "DESC" : "ASC");
        } else {
            // Default to ASC for new field (except CREATE_DATETIME which defaults to DESC)
            const defaultDirection = field === "CREATE_DATETIME" ? "DESC" : "ASC";
            onSortChange(field, defaultDirection);
        }
    };

    // Render sort indicator
    const renderSortIndicator = (field) => {
        if (field !== currentSortField) return null;
        return (
            <span className="sort-indicator">
                {currentSortDirection === "ASC" ? "↑" : "↓"}
            </span>
        );
    };

    // Define priority options
    const priorityOptions = [
        { value: "high", label: "High (8-10)", class: "priority-high" },
        { value: "medium", label: "Medium (4-7)", class: "priority-medium" },
        { value: "low", label: "Low (1-3)", class: "priority-low" }
    ];

    // Get client list with search filtering
    const getSortedClients = () => {
        if (!refData?.clients) return [];

        const sortedClients = [...refData.clients].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        if (clientSearchQuery) {
            return sortedClients.filter(client =>
                client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
            );
        }

        return sortedClients;
    };

    // Check if a priority level is selected (partially or fully)
    const isPrioritySelected = (priorityLevel) => {
        const currentPriorities = filters.priorityIn || [];
        const priorityRanges = {
            "high": [8, 9, 10],
            "medium": [4, 5, 6, 7],
            "low": [1, 2, 3]
        };

        // Check if any priority in this level is selected
        return priorityRanges[priorityLevel].some(p => currentPriorities.includes(p));
    };

    return (
        <div className="task-filter-panel-container">
            {/* Search and Basic Filters Bar */}
            <div className="task-filter-bar">
                <div className="filter-actions">
                    <div className="filter-buttons">
                        <Button
                            variant={viewMode === "active" ? "primary" : "outline"}
                            size="small"
                            onClick={() => onViewModeChange("active")}
                            className="filter-button"
                        >
                            Active Tasks
                        </Button>
                        <Button
                            variant={viewMode === "all" ? "primary" : "outline"}
                            size="small"
                            onClick={() => onViewModeChange("all")}
                            className="filter-button"
                        >
                            All Tasks
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
                        placeholder="Search by task name..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Search tasks"
                    />
                    {searchQuery && (
                        <button
                            className="clear-search"
                            onClick={() => onSearchChange("")}
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
                            className={`sort-option ${currentSortField === "NAME" ? "active" : ""}`}
                            onClick={() => handleSortChange("NAME")}
                        >
                            Name {renderSortIndicator("NAME")}
                        </button>
                        <button
                            className={`sort-option ${currentSortField === "PRIORITY" ? "active" : ""}`}
                            onClick={() => handleSortChange("PRIORITY")}
                        >
                            Priority {renderSortIndicator("PRIORITY")}
                        </button>
                        <button
                            className={`sort-option ${currentSortField === "DEADLINE" ? "active" : ""}`}
                            onClick={() => handleSortChange("DEADLINE")}
                        >
                            Deadline {renderSortIndicator("DEADLINE")}
                        </button>
                        <button
                            className={`sort-option ${currentSortField === "STATUS" ? "active" : ""}`}
                            onClick={() => handleSortChange("STATUS")}
                        >
                            Status {renderSortIndicator("STATUS")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="active-filters-display">
                    <div className="active-filters-label">Active Filters:</div>
                    <div className="active-filters-list">
                        {filters.nameContains && (
                            <div className="active-filter">
                                <span className="filter-name">Search:</span>
                                <span className="filter-value">"{filters.nameContains}"</span>
                                <button
                                    className="remove-filter"
                                    onClick={() => onSearchChange("")}
                                    aria-label="Remove search filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.statusIds?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Status:</span>
                                <span className="filter-value">
                                    {refData?.taskStatuses
                                        .filter(s => filters.statusIds.includes(s.id))
                                        .map(s => s.name)
                                        .join(', ')}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('statusIds', [])}
                                    aria-label="Remove status filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.priorityIn?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Priority:</span>
                                <span className="filter-value">
                                    {filters.priorityIn.length} values
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('priorityIn', [])}
                                    aria-label="Remove priority filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {(filters.deadlineFrom || filters.deadlineTo) && (
                            <div className="active-filter">
                                <span className="filter-name">Deadline:</span>
                                <span className="filter-value">
                                    {filters.deadlineFrom && `From: ${filters.deadlineFrom}`}
                                    {filters.deadlineFrom && filters.deadlineTo && ' - '}
                                    {filters.deadlineTo && `To: ${filters.deadlineTo}`}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => {
                                        applyFilter('deadlineFrom', null);
                                        applyFilter('deadlineTo', null);
                                    }}
                                    aria-label="Remove deadline filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Add more active filters here as needed */}
                    </div>

                    <Button
                        variant="outline"
                        size="small"
                        className="clear-filters-btn"
                        onClick={onClearAllFilters}
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
                                {/* Task Status Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Task Status</h3>
                                    <div className="filter-chips">
                                        {refData?.taskStatuses.map(status => (
                                            <div
                                                key={status.id}
                                                className={`filter-chip ${(filters.statusIds || []).includes(status.id) ? 'selected' : ''}`}
                                                onClick={() => handleStatusToggle(status.id)}
                                            >
                                                {status.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Priority Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Priority</h3>
                                    <div className="filter-chips">
                                        {priorityOptions.map(option => (
                                            <div
                                                key={option.value}
                                                className={`filter-chip ${option.class} ${isPrioritySelected(option.value) ? 'selected' : ''}`}
                                                onClick={() => handlePriorityToggle(option.value)}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Deadline Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Deadline</h3>
                                    <div className="date-filter-grid">
                                        <div className="date-inputs">
                                            <div className="date-range-input">
                                                <label>From:</label>
                                                <input
                                                    type="date"
                                                    value={filters.deadlineFrom || ""}
                                                    onChange={(e) => handleDateChange("deadlineFrom", e.target.value)}
                                                />
                                            </div>
                                            <div className="date-range-input">
                                                <label>To:</label>
                                                <input
                                                    type="date"
                                                    value={filters.deadlineTo || ""}
                                                    onChange={(e) => handleDateChange("deadlineTo", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="quick-date-filters">
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => applyQuickDateFilter(7)}
                                            >
                                                Next 7 days
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => applyQuickDateFilter(30)}
                                            >
                                                Next 30 days
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => applyQuickDateFilter('overdue')}
                                            >
                                                Overdue
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* More filters can be added here as needed */}
                                {/* For example: Start Date, End Date, Service Type filters */}

                                {/* Advanced Dates Section - can be extended */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">More Date Filters</h3>
                                    <div className="date-subsections">
                                        {/* Start Date Range */}
                                        <div className="date-subsection">
                                            <h4 className="date-subsection-title">Start Date</h4>
                                            <div className="date-inputs">
                                                <div className="date-range-input">
                                                    <label>From:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.startDateFrom || ""}
                                                        onChange={(e) => handleDateChange("startDateFrom", e.target.value)}
                                                    />
                                                </div>
                                                <div className="date-range-input">
                                                    <label>To:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.startDateTo || ""}
                                                        onChange={(e) => handleDateChange("startDateTo", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* End Date Range */}
                                        <div className="date-subsection">
                                            <h4 className="date-subsection-title">End Date</h4>
                                            <div className="date-inputs">
                                                <div className="date-range-input">
                                                    <label>From:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.endDateFrom || ""}
                                                        onChange={(e) => handleDateChange("endDateFrom", e.target.value)}
                                                    />
                                                </div>
                                                <div className="date-range-input">
                                                    <label>To:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.endDateTo || ""}
                                                        onChange={(e) => handleDateChange("endDateTo", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Created Date Range */}
                                        <div className="date-subsection">
                                            <h4 className="date-subsection-title">Created Date</h4>
                                            <div className="date-inputs">
                                                <div className="date-range-input">
                                                    <label>From:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.createdFrom || ""}
                                                        onChange={(e) => handleDateChange("createdFrom", e.target.value)}
                                                    />
                                                </div>
                                                <div className="date-range-input">
                                                    <label>To:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.createdTo || ""}
                                                        onChange={(e) => handleDateChange("createdTo", e.target.value)}
                                                    />
                                                </div>
                                            </div>
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