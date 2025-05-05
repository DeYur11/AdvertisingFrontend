import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import "./TaskFilterPanel.css";

// GraphQL queries for filter reference data
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
                                            taskFilter,
                                            setTaskFilter,
                                            searchQuery,
                                            setSearchQuery,
                                            filters = {},
                                            setFilters,
                                            expanded,
                                            setExpanded,
                                            onSortChange,
                                            currentSortField = "DEADLINE",
                                            currentSortDirection = "ASC"
                                        }) {
    // Fetch reference data from database
    const { data: refData, loading } = useQuery(GET_FILTER_REFERENCE_DATA);

    // Local state for filter values
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const [clientSearchQuery, setClientSearchQuery] = useState("");

    // Update active filter count when filters change
    useEffect(() => {
        // Count active filters
        let count = 0;
        Object.keys(filters).forEach(key => {
            if (Array.isArray(filters[key]) && filters[key].length > 0) count++;
            else if (typeof filters[key] === 'object' && filters[key] !== null) count++;
            else if (filters[key]) count++;
        });

        setActiveFilterCount(count);
    }, [filters]);

    // Handle applying filter changes immediately
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
        else if (filterType === 'deadline') {
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
        const currentDeadline = filters.deadline || {};
        applyFilter('deadline', {
            ...currentDeadline,
            [type]: value
        });
    };

    // Reset all filters
    const handleResetFilters = () => {
        setFilters({});
        setClientSearchQuery("");
    };

    // Helper to apply quick date filters
    const applyQuickDateFilter = (days) => {
        const today = new Date();
        const targetDate = new Date();

        if (days === 'overdue') {
            // For overdue, we set "to" as today
            applyFilter('deadline', {
                from: null,
                to: today.toISOString().split('T')[0]
            });
        } else {
            // For future dates, we set "from" as today and "to" as X days from now
            targetDate.setDate(today.getDate() + days);
            applyFilter('deadline', {
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
            // New field, default to DESC for CREATE_DATETIME, ASC for others
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

    // Get unique priority values from tasks
    const priorityOptions = [
        { value: "high", label: "High (8-10)", class: "priority-high" },
        { value: "medium", label: "Medium (4-7)", class: "priority-medium" },
        { value: "low", label: "Low (1-3)", class: "priority-low" }
    ];

    // Get sorted clients with filtered search
    const getSortedClients = () => {
        if (!refData?.clients) return [];

        // Sort alphabetically by name
        const sortedClients = [...refData.clients].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        // Filter by search query if it exists
        if (clientSearchQuery) {
            return sortedClients.filter(client =>
                client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
            );
        }

        return sortedClients;
    };

    return (
        <div className="task-filter-panel-container">
            {/* Search and Basic Filters Bar */}
            <div className="task-filter-bar">
                <div className="filter-actions">
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

                        {filters.priority?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Priority:</span>
                                <span className="filter-value">
                                    {filters.priority.join(', ')}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('priority', [])}
                                    aria-label="Remove priority filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.deadline && (
                            <div className="active-filter">
                                <span className="filter-name">Deadline:</span>
                                <span className="filter-value">
                                    {filters.deadline.from &&
                                        `From: ${new Date(filters.deadline.from).toLocaleDateString()}`}
                                    {filters.deadline.from && filters.deadline.to && ' - '}
                                    {filters.deadline.to &&
                                        `To: ${new Date(filters.deadline.to).toLocaleDateString()}`}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('deadline', {})}
                                    aria-label="Remove deadline filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.projectType?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Project Type:</span>
                                <span className="filter-value">
                                    {filters.projectType.join(', ')}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('projectType', [])}
                                    aria-label="Remove project type filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.clientId?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Client:</span>
                                <span className="filter-value">
                                    {refData?.clients
                                        .filter(c => filters.clientId.includes(c.id))
                                        .map(c => c.name)
                                        .join(', ')}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('clientId', [])}
                                    aria-label="Remove client filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.serviceType?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Service Type:</span>
                                <span className="filter-value">
                                    {filters.serviceType.join(', ')}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('serviceType', [])}
                                    aria-label="Remove service type filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {activeFilterCount > 0 && (
                        <Button
                            variant="outline"
                            size="small"
                            className="clear-filters-btn"
                            onClick={handleResetFilters}
                        >
                            Clear All
                        </Button>
                    )}
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
                                                className={`filter-chip ${(filters.status || []).includes(status.id) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('status', status.id)}
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
                                                className={`filter-chip ${option.class} ${(filters.priority || []).includes(option.value) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('priority', option.value)}
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
                                                    value={filters.deadline?.from || ""}
                                                    onChange={(e) => handleDateChange("from", e.target.value)}
                                                />
                                            </div>
                                            <div className="date-range-input">
                                                <label>To:</label>
                                                <input
                                                    type="date"
                                                    value={filters.deadline?.to || ""}
                                                    onChange={(e) => handleDateChange("to", e.target.value)}
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

                                {/* Project Type Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Project Type</h3>
                                    <div className="filter-chips">
                                        {refData?.projectTypes.map(type => (
                                            <div
                                                key={type.id}
                                                className={`filter-chip ${(filters.projectType || []).includes(type.name) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('projectType', type.name)}
                                            >
                                                {type.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Client Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Client</h3>

                                    {/* Search bar for clients */}
                                    <div className="client-search-container">
                                        <input
                                            type="text"
                                            className="client-search-input"
                                            placeholder="Search clients..."
                                            value={clientSearchQuery}
                                            onChange={(e) => setClientSearchQuery(e.target.value)}
                                            aria-label="Search clients"
                                        />
                                        {clientSearchQuery && (
                                            <button
                                                className="clear-client-search"
                                                onClick={() => setClientSearchQuery("")}
                                                aria-label="Clear client search"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    <div className="client-list">
                                        {getSortedClients().map(client => (
                                            <div
                                                key={client.id}
                                                className={`client-item ${(filters.clientId || []).includes(client.id) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('clientId', client.id)}
                                            >
                                                {client.name}
                                                {(filters.clientId || []).includes(client.id) && (
                                                    <span className="client-selected-check">✓</span>
                                                )}
                                            </div>
                                        ))}
                                        {getSortedClients().length === 0 && (
                                            <div className="no-clients-found">No clients found</div>
                                        )}
                                    </div>
                                </div>

                                {/* Service Type Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Service Type</h3>
                                    <div className="filter-chips">
                                        {refData?.serviceTypes.map(type => (
                                            <div
                                                key={type.id}
                                                className={`filter-chip ${(filters.serviceType || []).includes(type.name) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('serviceType', type.name)}
                                            >
                                                {type.name}
                                            </div>
                                        ))}
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