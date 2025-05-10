// src/pages/ServiceTracker Page/components/ServiceFilterPanel/ServiceFilterPanel.jsx
import { useState } from "react";
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import Modal from "../../../../components/common/Modal/Modal";
import "./ServiceFilterPanel.css";

export default function ServiceFilterPanel({
                                               filters,
                                               setFilters,
                                               onRefresh,
                                               filterOptions = {}
                                           }) {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        serviceTypeIds: filters.serviceTypeIds || [],
        projectStatusIds: filters.projectStatusIds || [],
        projectTypeIds: filters.projectTypeIds || [],
        clientIds: filters.clientIds || [],
        managerIds: filters.managerIds || [],
        serviceInProgressStatusIds: filters.serviceInProgressStatusIds || [],
        dateRange: {
            startDateFrom: filters.dateRange?.startDateFrom || "",
            startDateTo: filters.dateRange?.startDateTo || "",
            endDateFrom: filters.dateRange?.endDateFrom || "",
            endDateTo: filters.dateRange?.endDateTo || ""
        },
        costRange: {
            costMin: filters.costRange?.costMin || "",
            costMax: filters.costRange?.costMax || ""
        }
    });

    // Handle basic search input
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    };

    // Handle simple filter toggles
    const handleFilterToggle = (e) => {
        setFilters(prev => ({ ...prev, onlyMismatched: e.target.checked }));
    };

    const handleGroupToggle = (e) => {
        setFilters(prev => ({ ...prev, groupByProject: e.target.checked }));
    };

    // Handle advanced filter changes
    const handleAdvancedFilterChange = (category, id) => {
        setAdvancedFilters(prev => {
            const newIds = prev[category].includes(id)
                ? prev[category].filter(item => item !== id)
                : [...prev[category], id];

            return {
                ...prev,
                [category]: newIds
            };
        });
    };

    const handleDateRangeChange = (field, value) => {
        setAdvancedFilters(prev => ({
            ...prev,
            dateRange: {
                ...prev.dateRange,
                [field]: value
            }
        }));
    };

    const handleCostRangeChange = (field, value) => {
        setAdvancedFilters(prev => ({
            ...prev,
            costRange: {
                ...prev.costRange,
                [field]: value
            }
        }));
    };

    // Apply advanced filters
    const applyAdvancedFilters = () => {
        setFilters(prev => ({
            ...prev,
            ...advancedFilters
        }));
        setShowAdvancedFilters(false);
    };

    // Reset all filters
    const resetAllFilters = () => {
        const emptyFilters = {
            serviceTypeIds: [],
            projectStatusIds: [],
            projectTypeIds: [],
            clientIds: [],
            managerIds: [],
            serviceInProgressStatusIds: [],
            dateRange: {
                startDateFrom: "",
                startDateTo: "",
                endDateFrom: "",
                endDateTo: ""
            },
            costRange: {
                costMin: "",
                costMax: ""
            }
        };

        setAdvancedFilters(emptyFilters);
        setFilters(prev => ({
            ...prev,
            searchQuery: "",
            onlyMismatched: true,
            ...emptyFilters
        }));
    };

    // Count active filters
    const countActiveFilters = () => {
        let count = 0;

        if (filters.serviceTypeIds?.length > 0) count += filters.serviceTypeIds.length;
        if (filters.projectStatusIds?.length > 0) count += filters.projectStatusIds.length;
        if (filters.projectTypeIds?.length > 0) count += filters.projectTypeIds.length;
        if (filters.clientIds?.length > 0) count += filters.clientIds.length;
        if (filters.managerIds?.length > 0) count += filters.managerIds.length;
        if (filters.serviceInProgressStatusIds?.length > 0) count += filters.serviceInProgressStatusIds.length;

        if (filters.dateRange?.startDateFrom) count++;
        if (filters.dateRange?.startDateTo) count++;
        if (filters.dateRange?.endDateFrom) count++;
        if (filters.dateRange?.endDateTo) count++;

        if (filters.costRange?.costMin) count++;
        if (filters.costRange?.costMax) count++;

        return count;
    };

    const activeFilterCount = countActiveFilters();

    return (
        <div className="filter-panel">
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
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="filter-options">
                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={filters.groupByProject}
                            onChange={handleGroupToggle}
                        />
                        <span>Group by project</span>
                    </label>

                    <Button
                        variant={activeFilterCount > 0 ? "primary" : "outline"}
                        size="small"
                        onClick={() => setShowAdvancedFilters(true)}
                        className="advanced-filter-btn"
                    >
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge
                                variant="primary"
                                size="small"
                                className="filter-count-badge"
                            >
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                </div>

            </div>

            {/* Advanced Filters Modal */}
            <Modal
                isOpen={showAdvancedFilters}
                onClose={() => setShowAdvancedFilters(false)}
                title="Advanced Filters"
                size="large"
            >
                <div className="advanced-filters-container">
                    <div className="filters-grid">
                        {/* Service Type Filters */}
                        <div className="filter-section">
                            <h3 className="filter-section-title">Service Types</h3>
                            <div className="filter-options-list">
                                {filterOptions.serviceTypes?.map(type => (
                                    <label key={type.id} className="filter-option-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={advancedFilters.serviceTypeIds.includes(type.id)}
                                            onChange={() => handleAdvancedFilterChange('serviceTypeIds', type.id)}
                                        />
                                        <span>{type.name}</span>
                                    </label>
                                ))}
                                {!filterOptions.serviceTypes?.length && (
                                    <div className="no-options-message">No service types available</div>
                                )}
                            </div>
                        </div>

                        {/* Project Status Filters */}
                        <div className="filter-section">
                            <h3 className="filter-section-title">Project Status</h3>
                            <div className="filter-options-list">
                                {filterOptions.projectStatuses?.map(status => (
                                    <label key={status.id} className="filter-option-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={advancedFilters.projectStatusIds.includes(status.id)}
                                            onChange={() => handleAdvancedFilterChange('projectStatusIds', status.id)}
                                        />
                                        <span>{status.name}</span>
                                    </label>
                                ))}
                                {!filterOptions.projectStatuses?.length && (
                                    <div className="no-options-message">No project statuses available</div>
                                )}
                            </div>
                        </div>

                        {/* Project Type Filters */}
                        <div className="filter-section">
                            <h3 className="filter-section-title">Project Types</h3>
                            <div className="filter-options-list">
                                {filterOptions.projectTypes?.map(type => (
                                    <label key={type.id} className="filter-option-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={advancedFilters.projectTypeIds.includes(type.id)}
                                            onChange={() => handleAdvancedFilterChange('projectTypeIds', type.id)}
                                        />
                                        <span>{type.name}</span>
                                    </label>
                                ))}
                                {!filterOptions.projectTypes?.length && (
                                    <div className="no-options-message">No project types available</div>
                                )}
                            </div>
                        </div>

                        {/* Client Filters */}
                        <div className="filter-section">
                            <h3 className="filter-section-title">Clients</h3>
                            <div className="filter-options-list scrollable">
                                {filterOptions.clients?.map(client => (
                                    <label key={client.id} className="filter-option-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={advancedFilters.clientIds.includes(client.id)}
                                            onChange={() => handleAdvancedFilterChange('clientIds', client.id)}
                                        />
                                        <span>{client.name}</span>
                                    </label>
                                ))}
                                {!filterOptions.clients?.length && (
                                    <div className="no-options-message">No clients available</div>
                                )}
                            </div>
                        </div>

                        {/* Manager Filters */}
                        <div className="filter-section">
                            <h3 className="filter-section-title">Project Managers</h3>
                            <div className="filter-options-list scrollable">
                                {filterOptions.managers?.map(manager => (
                                    <label key={manager.id} className="filter-option-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={advancedFilters.managerIds.includes(manager.id)}
                                            onChange={() => handleAdvancedFilterChange('managerIds', manager.id)}
                                        />
                                        <span>{manager.name} {manager.surname}</span>
                                    </label>
                                ))}
                                {!filterOptions.managers?.length && (
                                    <div className="no-options-message">No managers available</div>
                                )}
                            </div>
                        </div>

                        {/* Service Status Filters */}
                        <div className="filter-section">
                            <h3 className="filter-section-title">Service Implementation Status</h3>
                            <div className="filter-options-list">
                                {filterOptions.serviceStatuses?.map(status => (
                                    <label key={status.id} className="filter-option-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={advancedFilters.serviceInProgressStatusIds.includes(status.id)}
                                            onChange={() => handleAdvancedFilterChange('serviceInProgressStatusIds', status.id)}
                                        />
                                        <span>{status.name}</span>
                                    </label>
                                ))}
                                {!filterOptions.serviceStatuses?.length && (
                                    <div className="no-options-message">No service statuses available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Project Date Range Filters */}
                    <div className="filter-section date-range-section">
                        <h3 className="filter-section-title">Project Date Range</h3>
                        <div className="date-range-container">
                            <div className="date-range-group">
                                <label className="date-range-label">Start Date</label>
                                <div className="date-inputs">
                                    <div className="date-input-group">
                                        <label>From:</label>
                                        <input
                                            type="date"
                                            value={advancedFilters.dateRange.startDateFrom}
                                            onChange={(e) => handleDateRangeChange('startDateFrom', e.target.value)}
                                            className="date-input"
                                        />
                                    </div>
                                    <div className="date-input-group">
                                        <label>To:</label>
                                        <input
                                            type="date"
                                            value={advancedFilters.dateRange.startDateTo}
                                            onChange={(e) => handleDateRangeChange('startDateTo', e.target.value)}
                                            className="date-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="date-range-group">
                                <label className="date-range-label">End Date</label>
                                <div className="date-inputs">
                                    <div className="date-input-group">
                                        <label>From:</label>
                                        <input
                                            type="date"
                                            value={advancedFilters.dateRange.endDateFrom}
                                            onChange={(e) => handleDateRangeChange('endDateFrom', e.target.value)}
                                            className="date-input"
                                        />
                                    </div>
                                    <div className="date-input-group">
                                        <label>To:</label>
                                        <input
                                            type="date"
                                            value={advancedFilters.dateRange.endDateTo}
                                            onChange={(e) => handleDateRangeChange('endDateTo', e.target.value)}
                                            className="date-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cost Range Filters */}
                    <div className="filter-section cost-range-section">
                        <h3 className="filter-section-title">Cost Range</h3>
                        <div className="cost-range-container">
                            <div className="cost-input-group">
                                <label>Min Cost ($):</label>
                                <input
                                    type="number"
                                    value={advancedFilters.costRange.costMin}
                                    onChange={(e) => handleCostRangeChange('costMin', e.target.value)}
                                    className="cost-input"
                                    placeholder="Minimum"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="cost-input-group">
                                <label>Max Cost ($):</label>
                                <input
                                    type="number"
                                    value={advancedFilters.costRange.costMax}
                                    onChange={(e) => handleCostRangeChange('costMax', e.target.value)}
                                    className="cost-input"
                                    placeholder="Maximum"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="service-filter-actions">
                        <Button
                            variant="outline"
                            onClick={resetAllFilters}
                        >
                            Reset All Filters
                        </Button>
                        <Button
                            variant="primary"
                            onClick={applyAdvancedFilters}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}