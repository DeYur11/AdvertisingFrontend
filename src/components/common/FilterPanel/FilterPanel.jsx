import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import Button from "../Button/Button"

import "./FilterPanel.css";
import {DateRangeFilter, FilterValueDisplay, MultiSelectFilter, SearchableSelectFilter} from "../Filters/Filters";
import Card from "../Card/Card";


const ActiveFiltersDisplay = ({ filters, filterConfig, refData, onRemoveFilter, onReset }) => (
    <div className="active-filters">
        {filterConfig.map(config => {
            const value = filters[config.key];
            if (!value) return null;

            return (
                <div key={config.key} className="active-filter-item">
                    <span>{config.label}: </span>
                    <FilterValueDisplay
                        config={config}
                        value={value}
                        refData={refData}
                    />
                    <button onClick={() => onRemoveFilter(config.key, null)}>×</button>
                </div>
            );
        })}
        <Button onClick={onReset}>Clear All</Button>
    </div>
);

// FilterSection.jsx
const FilterSection = ({ config, filters, refData, searchQuery, onSearch, onChange }) => {
    switch (config.type) {
        case 'multi-select':
            return <MultiSelectFilter {...{ config, filters, refData, onChange }} />;
        case 'date-range':
            return <DateRangeFilter {...{ config, filters, onChange }} />;
        case 'searchable-select':
            return <SearchableSelectFilter {...{ config, refData, searchQuery, onSearch, onChange }} />;
        default:
            return null;
    }
};

const renderSortIndicator = (field, currentSort) => {
    if (currentSort.field !== field) return null;
    return currentSort.direction === "ASC" ? "↑" : "↓";
};

const handleSortChange = (sortOption, currentSort, onSortChange) => {
    if (sortOption.field === currentSort.field) {
        // Змінюємо напрямок якщо клікнули на той самий поле
        const newDirection = currentSort.direction === "ASC" ? "DESC" : "ASC";
        onSortChange({ ...currentSort, direction: newDirection });
    } else {
        // Встановлюємо нове поле сортування з дефолтним напрямком
        onSortChange({
            field: sortOption.field,
            direction: sortOption.defaultDirection || "ASC"
        });
    }
};

// Оновлюємо компонент FilterPanel
const FilterPanel = ({
                         entityName,
                         filterConfig,
                         sortConfig,
                         gqlQuery,
                         searchConfig,
                         initialFilters = {},
                         onFilterChange,
                         onSortChange,
                         currentSort,
                     }) => {
    const [expanded, setExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState(initialFilters);
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const [searchQueries, setSearchQueries] = useState({});

    const { data: refData, loading } = useQuery(gqlQuery);

    useEffect(() => {
        let count = 0;
        Object.keys(localFilters).forEach(key => {
            const value = localFilters[key];
            if (Array.isArray(value) && value.length > 0) count++;
            else if (typeof value === "object" && value !== null) count++;
            else if (value !== null && value !== "") count++;
        });
        setActiveFilterCount(count);
    }, [localFilters]);

    const applyFilter = (filterKey, value) => {
        const newFilters = { ...localFilters };

        if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
            delete newFilters[filterKey];
        } else {
            newFilters[filterKey] = value;
        }

        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleResetFilters = () => {
        setLocalFilters({});
        setSearchQueries({});
        onFilterChange({});
    };

    // Додаткові функції обробки фільтрів...

    return (
        <div className={`filter-panel ${entityName}-filters`}>
            {/* Search and Sort Controls Bar */}
            <div className="filter-controls-bar">
                <div className="filter-actions">
                    <Button
                        variant={expanded ? "primary" : "outline"}
                        onClick={() => setExpanded(!expanded)}
                    >
                        Filters ({activeFilterCount})
                    </Button>
                </div>

                {searchConfig && (
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder={searchConfig.placeholder}
                            value={searchConfig.value}
                            onChange={e => searchConfig.onChange(e.target.value)}
                            aria-label="Search"
                        />
                        {searchConfig.value && (
                            <button
                                className="clear-search"
                                onClick={() => searchConfig.onChange('')}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                )}

                <div className="sort-controls">
                    {sortConfig.map((sortOption) => (
                        <button
                            key={sortOption.field}
                            className={`sort-option ${
                                currentSort.field === sortOption.field ? 'active' : ''
                            }`}
                            onClick={() => handleSortChange(
                                sortOption,
                                currentSort,
                                onSortChange
                            )}
                        >
                            {sortOption.label}
                            {renderSortIndicator(sortOption.field, currentSort)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <ActiveFiltersDisplay
                    filters={localFilters}
                    filterConfig={filterConfig}
                    refData={refData}
                    onRemoveFilter={applyFilter}
                    onReset={handleResetFilters}
                />
            )}

            {/* Expanded Filters Panel */}
            {expanded && (
                <Card className="advanced-filters">
                    {loading ? (
                        <div className="loading-indicator">Loading filter options...</div>
                    ) : (
                        <div className="filter-sections">
                            {filterConfig.map((config) => (
                                <FilterSection
                                    key={config.key}
                                    config={config}
                                    filters={localFilters}
                                    refData={refData}
                                    searchQuery={searchQueries[config.key]}
                                    onSearch={val => setSearchQueries(prev => ({
                                        ...prev,
                                        [config.key]: val
                                    }))}
                                    onChange={applyFilter}
                                />
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default FilterPanel;