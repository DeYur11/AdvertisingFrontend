// src/pages/EmployeeManagement/components/FilterPanel/FilterPanel.jsx
import { useState } from "react";
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import "./FilterPanel.css";

export default function FilterPanel({
                                        positions = [],
                                        offices = [],
                                        filters,
                                        onFilterChange
                                    }) {
    const [expanded, setExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.nameContains || "");
    const [selectedPositions, setSelectedPositions] = useState(filters.positionIds || []);
    const [selectedOffices, setSelectedOffices] = useState(filters.officeIds || []);
    const [isReviewer, setIsReviewer] = useState(filters.isReviewer);

    // Count active filters
    const countActiveFilters = () => {
        let count = 0;
        if (filters.nameContains) count++;
        if (filters.positionIds?.length) count += filters.positionIds.length;
        if (filters.officeIds?.length) count += filters.officeIds.length;
        if (filters.isReviewer !== null) count++;
        return count;
    };

    const activeFilterCount = countActiveFilters();

    // Apply filters
    const applyFilters = () => {
        onFilterChange({
            ...filters,
            nameContains: searchQuery.trim(),
            positionIds: selectedPositions,
            officeIds: selectedOffices,
            isReviewer: isReviewer
        });
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery("");
        setSelectedPositions([]);
        setSelectedOffices([]);
        setIsReviewer(null);

        onFilterChange({
            nameContains: "",
            positionIds: [],
            officeIds: [],
            isReviewer: null
        });
    };

    // Toggle position selection
    const togglePosition = (positionId) => {
        setSelectedPositions(prev => {
            if (prev.includes(positionId)) {
                return prev.filter(id => id !== positionId);
            } else {
                return [...prev, positionId];
            }
        });
    };

    // Toggle office selection
    const toggleOffice = (officeId) => {
        setSelectedOffices(prev => {
            if (prev.includes(officeId)) {
                return prev.filter(id => id !== officeId);
            } else {
                return [...prev, officeId];
            }
        });
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle search submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    // Toggle reviewer filter
    const toggleReviewerFilter = (value) => {
        setIsReviewer(isReviewer === value ? null : value);
    };

    return (
        <div className={`filter-panel ${expanded ? 'expanded' : ''}`}>
            <div className="filter-panel-header">
                <div className="search-bar">
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Пошук працівників за ім’ям або прізвищем..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            <span className="search-icon">🔍</span>
                        </button>
                        {searchQuery && (
                            <button
                                type="button"
                                className="clear-search"
                                onClick={() => {
                                    setSearchQuery("");
                                    onFilterChange({
                                        ...filters,
                                        nameContains: ""
                                    });
                                }}
                            >
                                ×
                            </button>
                        )}
                    </form>
                </div>

                <div className="filter-actions">
                    <button
                        className={`filter-toggle ${activeFilterCount > 0 ? 'has-filters' : ''}`}
                        onClick={() => setExpanded(!expanded)}
                    >
                        Фільтри
                        {activeFilterCount > 0 && (
                            <Badge variant="primary" size="small" className="filter-count">
                                {activeFilterCount}
                            </Badge>
                        )}
                        <span className="toggle-icon">{expanded ? '▲' : '▼'}</span>
                    </button>
                    {activeFilterCount > 0 && (
                        <Button
                            variant="outline"
                            size="small"
                            onClick={resetFilters}
                        >
                            Скинути все
                        </Button>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="filter-panel-content">
                    <div className="filter-section">
                        <h3 className="filter-section-title">Посада</h3>
                        <div className="filter-options">
                            {positions.map(position => (
                                <label key={position.id} className="filter-option">
                                    <input
                                        type="checkbox"
                                        checked={selectedPositions.includes(position.id)}
                                        onChange={() => togglePosition(position.id)}
                                    />
                                    <span>{position.name}</span>
                                </label>
                            ))}
                            {positions.length === 0 && (
                                <div className="no-options">Немає доступних посад</div>
                            )}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3 className="filter-section-title">Локація офісу</h3>
                        <div className="filter-options">
                            {offices.map(office => (
                                <label key={office.id} className="filter-option">
                                    <input
                                        type="checkbox"
                                        checked={selectedOffices.includes(office.id)}
                                        onChange={() => toggleOffice(office.id)}
                                    />
                                    <span>{office.city?.name} ({office.city?.country?.name})</span>
                                </label>
                            ))}
                            {offices.length === 0 && (
                                <div className="no-options">Немає доступних офісів</div>
                            )}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3 className="filter-section-title">Роль</h3>
                        <div className="filter-options role-filter">
                            <button
                                className={`role-btn ${isReviewer === true ? 'active' : ''}`}
                                onClick={() => toggleReviewerFilter(true)}
                            >
                                Рецензенти
                            </button>
                            <button
                                className={`role-btn ${isReviewer === false ? 'active' : ''}`}
                                onClick={() => toggleReviewerFilter(false)}
                            >
                                Звичайні працівники
                            </button>
                        </div>
                    </div>

                    <div className="filter-panel-footer">
                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => setExpanded(false)}
                        >
                            Скасувати
                        </Button>
                        <Button
                            variant="primary"
                            size="small"
                            onClick={() => {
                                applyFilters();
                                setExpanded(false);
                            }}
                        >
                            Застосувати фільтри
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

}