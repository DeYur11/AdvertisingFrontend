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
                                            setExpanded
                                        }) {
    // Fetch reference data from database
    const { data: refData, loading } = useQuery(GET_FILTER_REFERENCE_DATA);

    // Local state for filter values
    const [localFilters, setLocalFilters] = useState(filters);
    const [activeFilterCount, setActiveFilterCount] = useState(0);

    // Update active filter count and local filters when filters change
    useEffect(() => {
        setLocalFilters(filters);

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

    // Get unique priority values from tasks
    const priorityOptions = [
        { value: "high", label: "High (8-10)", class: "priority-high" },
        { value: "medium", label: "Medium (4-7)", class: "priority-medium" },
        { value: "low", label: "Low (1-3)", class: "priority-low" }
    ];

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
                  {filters.status.join(', ')}
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
                                                className={`filter-chip ${(filters.status || []).includes(status.name.toLowerCase()) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('status', status.name.toLowerCase())}
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
                                    <div className="select-wrapper">
                                        <select
                                            className="filter-select"
                                            multiple
                                            value={filters.clientId || []}
                                            onChange={(e) => {
                                                const selectedValues = Array.from(
                                                    e.target.selectedOptions,
                                                    option => option.value
                                                );
                                                applyFilter('clientId', selectedValues);
                                            }}
                                        >
                                            {refData?.clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="select-helper">Hold Ctrl/Cmd to select multiple</div>
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