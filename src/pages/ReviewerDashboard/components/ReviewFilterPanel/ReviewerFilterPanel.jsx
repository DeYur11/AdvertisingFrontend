import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import "./ReviewerFilterPanel.css";
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import Card from "../../../../components/common/Card/Card";
// Import queries
import { GET_FILTER_REFERENCE_DATA } from "../../graphql/reviewerQueries";
import {toast} from "react-toastify";

export default function ReviewerFilterPanel({
                                                searchQuery,
                                                setSearchQuery,
                                                searchType,
                                                setSearchType,
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
    const pendingReviewStatusId = 2;

    const handleOptionToggle = (filterType, optionValue) => {
        const optionValueInt = parseInt(optionValue, 10);

        // Заборонити вибір Pending Review вручну при активному фільтрі
        if (
            filterType === "status" &&
            filters.reviewStatus === "pending" &&
            optionValueInt === pendingReviewStatusId
        ) {

            return;
        }

        const currentValues = filters[filterType] || [];
        let newValues;

        if (currentValues.includes(optionValueInt)) {
            newValues = currentValues.filter(v => v !== optionValueInt);
        } else {
            newValues = [...currentValues, optionValueInt];
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
        setSearchType("both");
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

    // Handle search type change
    const handleSearchTypeChange = (type) => {
        setSearchType(type);
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
                        placeholder={`Search materials by ${searchType === "name" ? "name" : searchType === "description" ? "description" : "name or description"}...`}
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

                {/* Search Type Selector */}
                <div className="search-type-selector">
                    <Button
                        variant={searchType === "both" ? "primary" : "outline"}
                        size="small"
                        onClick={() => handleSearchTypeChange("both")}
                        className="search-type-button"
                    >
                        All Fields
                    </Button>
                    <Button
                        variant={searchType === "name" ? "primary" : "outline"}
                        size="small"
                        onClick={() => handleSearchTypeChange("name")}
                        className="search-type-button"
                    >
                        Name Only
                    </Button>
                    <Button
                        variant={searchType === "description" ? "primary" : "outline"}
                        size="small"
                        onClick={() => handleSearchTypeChange("description")}
                        className="search-type-button"
                    >
                        Description Only
                    </Button>
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


                        {filters.usageRestriction?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Usage Restriction:</span>
                                <span className="filter-value">{filters.usageRestriction.length} selected</span>
                                <button className="remove-filter" onClick={() => applyFilter('usageRestriction', [])}>✕</button>
                            </div>
                        )}

                        {filters.licenceType?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Licence Type:</span>
                                <span className="filter-value">{filters.licenceType.length} selected</span>
                                <button className="remove-filter" onClick={() => applyFilter('licenceType', [])}>✕</button>
                            </div>
                        )}

                        {filters.targetAudience?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Target Audience:</span>
                                <span className="filter-value">{filters.targetAudience.length} selected</span>
                                <button className="remove-filter" onClick={() => applyFilter('targetAudience', [])}>✕</button>
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

                        {filters.task?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Task:</span>
                                <span className="filter-value">
                                    {filters.task.length} selected
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('task', [])}
                                    aria-label="Remove task filter"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.keywords?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Keywords:</span>
                                <span className="filter-value">
                                    {filters.keywords.length} selected
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('keywords', [])}
                                    aria-label="Remove keywords filter"
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

                        {searchType !== "both" && (
                            <div className="active-filter">
                                <span className="filter-name">Search In:</span>
                                <span className="filter-value">
                                    {searchType === "name" ? "Name Only" : "Description Only"}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => setSearchType("both")}
                                    aria-label="Remove search type filter"
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
                                        {refData?.materialStatuses.map(status => {
                                            const isDisabled = filters.reviewStatus === "pending" && status.id === pendingReviewStatusId;
                                            const isSelected = (filters.status || []).includes(status.id);

                                            return (
                                                <div
                                                    key={status.id}
                                                    className={`filter-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                    onClick={() => {
                                                        if (!isDisabled) handleOptionToggle('status', status.id);
                                                    }}
                                                    title={isDisabled ? 'This status is included automatically with "Pending Review"' : ''}
                                                >
                                                    {status.name}
                                                </div>
                                            );
                                        })}
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
                                {refData?.usageRestrictions && (
                                    <div className="filter-section">
                                        <h3 className="filter-section-title">Usage Restriction</h3>
                                        <div className="filter-chips">
                                            {refData.usageRestrictions.map(restriction => (
                                                <div
                                                    key={restriction.id}
                                                    className={`filter-chip ${(filters.usageRestriction || []).includes(restriction.id) ? 'selected' : ''}`}
                                                    onClick={() => handleOptionToggle('usageRestriction', restriction.id)}
                                                >
                                                    {restriction.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Licence Type Filters */}
                                {refData?.licenceTypes && (
                                    <div className="filter-section">
                                        <h3 className="filter-section-title">Licence Type</h3>
                                        <div className="filter-chips">
                                            {refData.licenceTypes.map(licence => (
                                                <div
                                                    key={licence.id}
                                                    className={`filter-chip ${(filters.licenceType || []).includes(licence.id) ? 'selected' : ''}`}
                                                    onClick={() => handleOptionToggle('licenceType', licence.id)}
                                                >
                                                    {licence.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Target Audience Filters */}
                                {refData?.targetAudiences && (
                                    <div className="filter-section">
                                        <h3 className="filter-section-title">Target Audience</h3>
                                        <div className="filter-chips">
                                            {refData.targetAudiences.map(audience => (
                                                <div
                                                    key={audience.id}
                                                    className={`filter-chip ${(filters.targetAudience || []).includes(audience.id) ? 'selected' : ''}`}
                                                    onClick={() => handleOptionToggle('targetAudience', audience.id)}
                                                >
                                                    {audience.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Keywords Filters - if available in refData */}
                                {refData?.keywords && (
                                    <div className="filter-section">
                                        <h3 className="filter-section-title">Keywords</h3>
                                        <div className="filter-chips keywords-filter">
                                            {refData.keywords.map(keyword => (
                                                <div
                                                    key={keyword.id}
                                                    className={`filter-chip ${(filters.keywords || []).includes(keyword.id) ? 'selected' : ''}`}
                                                    onClick={() => handleOptionToggle('keywords', keyword.id)}
                                                >
                                                    #{keyword.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}


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