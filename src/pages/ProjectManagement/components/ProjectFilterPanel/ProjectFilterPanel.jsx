import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import "./ProjectFilterPanel.css";

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
        clients {
            id
            name
        }
    }
`;

export default function ProjectFilterPanel({
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
    const [clientSearchQuery, setClientSearchQuery] = useState("");

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
        else if (filterType === 'date') {
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
        const currentDate = filters.date || {};
        applyFilter('date', {
            ...currentDate,
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
            applyFilter('date', {
                from: null,
                to: today.toISOString().split('T')[0]
            });
        } else if (days === 'active') {
            // For active projects, we set "from" before today
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 7);
            applyFilter('date', {
                from: pastDate.toISOString().split('T')[0],
                to: null
            });
        } else {
            // For future dates, we set "from" as today and "to" as X days from now
            targetDate.setDate(today.getDate() + days);
            applyFilter('date', {
                from: today.toISOString().split('T')[0],
                to: targetDate.toISOString().split('T')[0]
            });
        }
    };

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
        <div className="project-filter-panel-container">
            {/* Search and Basic Filters Bar */}
            <div className="filter-bar">
                <div className="filter-actions">
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
                        placeholder="Search projects, services, or clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search projects"
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

                        {filters.date && (
                            <div className="active-filter">
                                <span className="filter-name">Date Range:</span>
                                <span className="filter-value">
                  {filters.date.from &&
                      `From: ${new Date(filters.date.from).toLocaleDateString()}`}
                                    {filters.date.from && filters.date.to && ' - '}
                                    {filters.date.to &&
                                        `To: ${new Date(filters.date.to).toLocaleDateString()}`}
                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('date', {})}
                                    aria-label="Remove date filter"
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
                                {/* Project Status Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Project Status</h3>
                                    <div className="filter-chips">
                                        {refData?.projectStatuses.map(status => (
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

                                {/* Date Filters */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Date Range</h3>
                                    <div className="date-filter-grid">
                                        <div className="date-inputs">
                                            <div className="date-range-input">
                                                <label>From:</label>
                                                <input
                                                    type="date"
                                                    value={filters.date?.from || ""}
                                                    onChange={(e) => handleDateChange("from", e.target.value)}
                                                />
                                            </div>
                                            <div className="date-range-input">
                                                <label>To:</label>
                                                <input
                                                    type="date"
                                                    value={filters.date?.to || ""}
                                                    onChange={(e) => handleDateChange("to", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="quick-date-filters">
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => applyQuickDateFilter('active')}
                                            >
                                                Active Projects
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
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}