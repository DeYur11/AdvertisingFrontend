// src/pages/ServiceTracker Page/components/ServiceFilterPanel/DynamicFilterPanel.jsx
import { useState } from "react";
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import Modal from "../../../../components/common/Modal/Modal";
import "./ServiceFilterPanel.css";

export default function DynamicFilterPanel({
                                               filters,
                                               setFilters,
                                               onRefresh,
                                               filterOptions = {}
                                           }) {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        serviceTypeIds: filters.serviceTypeIds || [],
        clientIds: filters.clientIds || [],
        costRange: {
            costMin: filters.costRange?.costMin || "",
            costMax: filters.costRange?.costMax || ""
        },
        projectStatusIds: filters.projectStatusIds || [],
        projectTypeIds: filters.projectTypeIds || [],
        managerIds: filters.managerIds || [],
        serviceInProgressStatusIds: filters.serviceInProgressStatusIds || [],
        dateRange: {
            startDateFrom: filters.dateRange?.startDateFrom || "",
            startDateTo: filters.dateRange?.startDateTo || "",
            endDateFrom: filters.dateRange?.endDateFrom || "",
            endDateTo: filters.dateRange?.endDateTo || ""
        }
    });

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    };

    const handleFilterToggle = (e) => {
        setFilters(prev => ({ ...prev, onlyMismatched: e.target.checked }));
    };

    const handleGroupToggle = (e) => {
        const updatedFilters = { ...filters, groupByProject: e.target.checked };
        if (e.target.checked) {
            updatedFilters.serviceInProgressStatusIds = [];
        } else {
            updatedFilters.projectStatusIds = [];
            updatedFilters.projectTypeIds = [];
            updatedFilters.managerIds = [];
        }
        setFilters(updatedFilters);
    };

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

    const applyAdvancedFilters = () => {
        setFilters(prev => ({
            ...prev,
            ...advancedFilters
        }));
        setShowAdvancedFilters(false);
    };

    const resetAllFilters = () => {
        const emptyFilters = {
            serviceTypeIds: [],
            clientIds: [],
            costRange: { costMin: "", costMax: "" },
            projectStatusIds: [],
            projectTypeIds: [],
            managerIds: [],
            serviceInProgressStatusIds: [],
            dateRange: {
                startDateFrom: "",
                startDateTo: "",
                endDateFrom: "",
                endDateTo: ""
            }
        };
        if (filters.groupByProject) {
            emptyFilters.projectStatusIds = [];
            emptyFilters.projectTypeIds = [];
            emptyFilters.managerIds = [];
        } else {
            emptyFilters.serviceInProgressStatusIds = [];
        }

        setAdvancedFilters(emptyFilters);
        setFilters(prev => ({
            ...prev,
            searchQuery: "",
            onlyMismatched: true,
            ...emptyFilters
        }));
    };

    const countActiveFilters = () => {
        let count = 0;
        if (filters.serviceTypeIds?.length > 0) count += filters.serviceTypeIds.length;
        if (filters.clientIds?.length > 0) count += filters.clientIds.length;

        if (filters.groupByProject) {
            if (filters.projectStatusIds?.length > 0) count += filters.projectStatusIds.length;
            if (filters.projectTypeIds?.length > 0) count += filters.projectTypeIds.length;
            if (filters.managerIds?.length > 0) count += filters.managerIds.length;
        } else {
            if (filters.serviceInProgressStatusIds?.length > 0) count += filters.serviceInProgressStatusIds.length;
        }

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
                        placeholder={filters.groupByProject ?
                            "Пошук за назвою проєкту, сервісу або клієнта..." :
                            "Пошук за назвою сервісу, проєкту або клієнта..."}
                        value={filters.searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    {filters.searchQuery && (
                        <button
                            className="clear-search"
                            onClick={() => setFilters(prev => ({ ...prev, searchQuery: "" }))}
                            aria-label="Очистити пошук"
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
                        <span>Показати лише незавершені сервіси</span>
                    </label>

                    <Button
                        variant={activeFilterCount > 0 ? "primary" : "outline"}
                        size="small"
                        onClick={() => setShowAdvancedFilters(true)}
                        className="advanced-filter-btn"
                    >
                        Фільтри
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

            <Modal
                isOpen={showAdvancedFilters}
                onClose={() => setShowAdvancedFilters(false)}
                title={filters.groupByProject ? "Фільтри проєктів" : "Фільтри сервісів"}
                size="large"
            >
                <div className="advanced-filters-container">
                    <div className="filters-grid">
                        {!filters.groupByProject && (
                            <div className="filter-section">
                                <h3 className="filter-section-title">Типи сервісів</h3>
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
                                        <div className="no-options-message">Немає доступних типів сервісів</div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="filter-section">
                            <h3 className="filter-section-title">Клієнти</h3>
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
                                    <div className="no-options-message">Немає доступних клієнтів</div>
                                )}
                            </div>
                        </div>

                        {filters.groupByProject ? (
                            <>
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Статуси проєктів</h3>
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
                                            <div className="no-options-message">Немає доступних статусів проєктів</div>
                                        )}
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h3 className="filter-section-title">Типи проєктів</h3>
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
                                            <div className="no-options-message">Немає доступних типів проєктів</div>
                                        )}
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h3 className="filter-section-title">Менеджери проєктів</h3>
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
                                            <div className="no-options-message">Немає доступних менеджерів</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="filter-section">
                                <h3 className="filter-section-title">Статуси реалізації сервісу</h3>
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
                                        <div className="no-options-message">Немає доступних статусів сервісів</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="filter-section date-range-section">
                        <h3 className="filter-section-title">
                            {filters.groupByProject ? "Діапазон дат проєкту" : "Діапазон дат сервісу"}
                        </h3>
                        <div className="date-range-container">
                            <div className="date-range-group">
                                <label className="date-range-label">Дата початку</label>
                                <div className="date-inputs">
                                    <div className="date-input-group">
                                        <label>Від:</label>
                                        <input
                                            type="date"
                                            value={advancedFilters.dateRange.startDateFrom}
                                            onChange={(e) => handleDateRangeChange('startDateFrom', e.target.value)}
                                            className="date-input"
                                        />
                                    </div>
                                    <div className="date-input-group">
                                        <label>До:</label>
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
                                <label className="date-range-label">Дата завершення</label>
                                <div className="date-inputs">
                                    <div className="date-input-group">
                                        <label>Від:</label>
                                        <input
                                            type="date"
                                            value={advancedFilters.dateRange.endDateFrom}
                                            onChange={(e) => handleDateRangeChange('endDateFrom', e.target.value)}
                                            className="date-input"
                                        />
                                    </div>
                                    <div className="date-input-group">
                                        <label>До:</label>
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

                    <div className="filter-section cost-range-section">
                        <h3 className="filter-section-title">Діапазон вартості</h3>
                        <div className="cost-range-container">
                            <div className="cost-input-group">
                                <label>Мін. вартість (₴):</label>
                                <input
                                    type="number"
                                    value={advancedFilters.costRange.costMin}
                                    onChange={(e) => handleCostRangeChange('costMin', e.target.value)}
                                    className="cost-input"
                                    placeholder="Мінімум"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="cost-input-group">
                                <label>Макс. вартість (₴):</label>
                                <input
                                    type="number"
                                    value={advancedFilters.costRange.costMax}
                                    onChange={(e) => handleCostRangeChange('costMax', e.target.value)}
                                    className="cost-input"
                                    placeholder="Максимум"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="service-filter-actions">
                        <Button
                            variant="outline"
                            onClick={resetAllFilters}
                        >
                            Скинути всі фільтри
                        </Button>
                        <Button
                            variant="primary"
                            onClick={applyAdvancedFilters}
                        >
                            Застосувати фільтри
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
