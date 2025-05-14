import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import "./ReviewerFilterPanel.css";
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import Card from "../../../../components/common/Card/Card";
// Import queries
import { GET_FILTER_REFERENCE_DATA } from "../../graphql/reviewerQueries";
import { toast } from "react-toastify";

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
        if (Array.isArray(value)) {
            if (value.length === 0) delete newFilters[filterType];
            else newFilters[filterType] = value;
        } else if (filterType === 'dateRange') {
            if (!value.from && !value.to) delete newFilters[filterType];
            else newFilters[filterType] = value;
        } else {
            if (!value) delete newFilters[filterType];
            else newFilters[filterType] = value;
        }
        setFilters(newFilters);
    };

    // Handle toggling multiselect chips
    const pendingReviewStatusId = 2;
    const handleOptionToggle = (filterType, optionValue) => {
        const optionValueInt = parseInt(optionValue, 10);
        if (
            filterType === "status" &&
            filters.reviewStatus === "pending" &&
            optionValueInt === pendingReviewStatusId
        ) {
            return;
        }
        const currentValues = filters[filterType] || [];
        const newValues = currentValues.includes(optionValueInt)
            ? currentValues.filter(v => v !== optionValueInt)
            : [...currentValues, optionValueInt];
        applyFilter(filterType, newValues);
    };

    // Handle date range
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

    // Quick date shortcuts
    const applyQuickDateFilter = (days) => {
        const today = new Date();
        const target = new Date();
        if (days === 'today') {
            const formatted = today.toISOString().split('T')[0];
            applyFilter('dateRange', { from: formatted, to: formatted });
        } else if (days === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            applyFilter('dateRange', {
                from: weekAgo.toISOString().split('T')[0],
                to: today.toISOString().split('T')[0]
            });
        } else {
            target.setDate(today.getDate() + days);
            applyFilter('dateRange', {
                from: today.toISOString().split('T')[0],
                to: target.toISOString().split('T')[0]
            });
        }
    };

    // Sort toggling
    const handleSortChange = (field) => {
        if (field === currentSortField) {
            onSortChange(field, currentSortDirection === "ASC" ? "DESC" : "ASC");
        } else {
            const defaultDir = field === "createDatetime" ? "DESC" : "ASC";
            onSortChange(field, defaultDir);
        }
    };

    // Search type
    const handleSearchTypeChange = (type) => setSearchType(type);

    const renderSortIndicator = (field) => {
        if (field !== currentSortField) return null;
        return <span className="sort-indicator">{currentSortDirection === "ASC" ? "↑" : "↓"}</span>;
    };

    return (
        <div className="reviewer-filter-panel-container">
            {/* Search & Basic Filters */}
            <div className="filter-bar">
                <div className="filter-actions">
                    <div className="review-status-tabs">
                        <Button
                            variant={!filters.reviewStatus || filters.reviewStatus === "all" ? "primary" : "outline"}
                            size="small"
                            onClick={() => applyFilter('reviewStatus', 'all')}
                            className="filter-button"
                        >
                            Усі матеріали
                        </Button>
                        <Button
                            variant={filters.reviewStatus === "pending" ? "primary" : "outline"}
                            size="small"
                            onClick={() => applyFilter('reviewStatus', 'pending')}
                            className="filter-button"
                        >
                            Очікують перевірки
                        </Button>
                    </div>
                    <Button
                        variant={expanded ? "primary" : "outline"}
                        size="small"
                        icon={expanded ? "🔽" : "🔍"}
                        className={`advanced-filter-button ${activeFilterCount > 0 ? 'has-active-filters' : ''}`}
                        onClick={() => setExpanded(!expanded)}
                    >
                        Фільтри {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </Button>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder={`Шукати матеріали за ${searchType === "name" ? "назвою" : searchType === "description" ? "описом" : "назвою або описом"}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery("")} aria-label="Очистити пошук">✕</button>
                    )}
                </div>

                <div className="search-type-selector">
                    <Button
                        variant={searchType === "both" ? "primary" : "outline"}
                        size="small"
                        onClick={() => handleSearchTypeChange("both")}
                        className="search-type-button"
                    >
                        Усі поля
                    </Button>
                    <Button
                        variant={searchType === "name" ? "primary" : "outline"}
                        size="small"
                        onClick={() => handleSearchTypeChange("name")}
                        className="search-type-button"
                    >
                        Тільки назва
                    </Button>
                    <Button
                        variant={searchType === "description" ? "primary" : "outline"}
                        size="small"
                        onClick={() => handleSearchTypeChange("description")}
                        className="search-type-button"
                    >
                        Тільки опис
                    </Button>
                </div>

                <div className="sort-controls">
                    <span className="sort-label">Сортувати за:</span>
                    <div className="sort-options">
                        <button
                            className={`sort-option ${currentSortField === "name" ? "active" : ""}`}
                            onClick={() => handleSortChange("name")}
                        >
                            Назва {renderSortIndicator("name")}
                        </button>
                        <button
                            className={`sort-option ${currentSortField === "status" ? "active" : ""}`}
                            onClick={() => handleSortChange("status")}
                        >
                            Статус {renderSortIndicator("status")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="active-filters-display">
                    <div className="active-filters-label">Активні фільтри:</div>
                    <div className="active-filters-list">
                        {/* Status */}
                        {filters.status?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Статус:</span>
                                <span className="filter-value">{filters.status.length} вибрано</span>
                                <button className="remove-filter" onClick={() => applyFilter('status', [])}>✕</button>
                            </div>
                        )}

                        {/* Material Type */}
                        {filters.materialType?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Тип матеріалу:</span>
                                <span className="filter-value">{filters.materialType.length} вибрано</span>
                                <button className="remove-filter" onClick={() => applyFilter('materialType', [])}>✕</button>
                            </div>
                        )}

                        {/* Language */}
                        {filters.language?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Мова:</span>
                                <span className="filter-value">{filters.language.length} вибрано</span>
                                <button className="remove-filter" onClick={() => applyFilter('language', [])}>✕</button>
                            </div>
                        )}

                        {/* Other filters... */}
                        {/* Usage Restriction */}
                        {filters.usageRestriction?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Обмеження використання:</span>
                                <span className="filter-value">{filters.usageRestriction.length} вибрано</span>
                                <button className="remove-filter" onClick={() => applyFilter('usageRestriction', [])}>✕</button>
                            </div>
                        )}

                        {/* Licence Type */}
                        {filters.licenceType?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Тип ліцензії:</span>
                                <span className="filter-value">{filters.licenceType.length} вибрано</span>
                                <button className="remove-filter" onClick={() => applyFilter('licenceType', [])}>✕</button>
                            </div>
                        )}

                        {/* Target Audience */}
                        {filters.targetAudience?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Цільова аудиторія:</span>
                                <span className="filter-value">{filters.targetAudience.length} вибрано</span>
                                <button className="remove-filter" onClick={() => applyFilter('targetAudience', [])}>✕</button>
                            </div>
                        )}

                        {/* Keywords */}
                        {filters.keywords?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Ключові слова:</span>
                                <span className="filter-value">{filters.keywords.length} вибрано</span>
                                <button className="remove-filter" onClick={() => applyFilter('keywords', [])}>✕</button>
                            </div>
                        )}

                        {/* Date Range */}
                        {filters.dateRange && (
                            <div className="active-filter">
                                <span className="filter-name">Діапазон дат:</span>
                                <span className="filter-value">
                                    {filters.dateRange.from && `Від: ${new Date(filters.dateRange.from).toLocaleDateString()}`}
                                    {filters.dateRange.from && filters.dateRange.to && ' - '}
                                    {filters.dateRange.to && `До: ${new Date(filters.dateRange.to).toLocaleDateString()}`}
                                </span>
                                <button className="remove-filter" onClick={() => applyFilter('dateRange', {})}>✕</button>
                            </div>
                        )}

                        {/* Review Status */}
                        {filters.reviewStatus && filters.reviewStatus !== 'all' && (
                            <div className="active-filter">
                                <span className="filter-name">Статус перевірки:</span>
                                <span className="filter-value">
                                    {filters.reviewStatus === 'pending' ? 'Очікує перевірки' : 'Перевірено мною'}
                                </span>
                                <button className="remove-filter" onClick={() => applyFilter('reviewStatus', 'all')}>✕</button>
                            </div>
                        )}

                        {/* Search Type */}
                        {searchType !== "both" && (
                            <div className="active-filter">
                                <span className="filter-name">Пошук у:</span>
                                <span className="filter-value">
                                    {searchType === "name" ? "Тільки назва" : "Тільки опис"}
                                </span>
                                <button className="remove-filter" onClick={() => setSearchType("both")}>✕</button>
                            </div>
                        )}
                    </div>

                    <Button variant="outline" size="small" className="clear-filters-btn" onClick={handleResetFilters}>
                        Очистити все
                    </Button>
                </div>
            )}

            {/* Advanced Filters Panel */}
            {expanded && (
                <Card className="advanced-filters-panel">
                    <div className="filters-content">
                        {loading ? (
                            <div className="loading-filters">Завантаження параметрів фільтрів...</div>
                        ) : (
                            <>
                                {/* Status */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Статус матеріалу</h3>
                                    <div className="filter-chips">
                                        {refData?.materialStatuses.map(status => {
                                            const isDisabled = filters.reviewStatus === "pending" && status.id === pendingReviewStatusId;
                                            const isSelected = (filters.status || []).includes(status.id);
                                            return (
                                                <div
                                                    key={status.id}
                                                    className={`filter-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                    onClick={() => !isDisabled && handleOptionToggle('status', status.id)}
                                                    title={isDisabled ? 'Автоматично включено з "Очікують перевірки"' : ''}
                                                >
                                                    {status.name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Material Type */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Тип матеріалу</h3>
                                    <div className="filter-chips">
                                        {refData?.materialTypes.map(mt => (
                                            <div
                                                key={mt.id}
                                                className={`filter-chip ${(filters.type || []).includes(parseInt(mt.id, 10)) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('type', mt.id)}
                                            >
                                                {mt.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Language */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Мова</h3>
                                    <div className="filter-chips">
                                        {refData?.languages.map(lang => (
                                            <div
                                                key={lang.id}
                                                className={`filter-chip ${(filters.language || []).includes(lang.id) ? 'selected' : ''}`}
                                                onClick={() => handleOptionToggle('language', lang.id)}
                                            >
                                                {lang.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Usage Restriction */}
                                {refData?.usageRestrictions && (
                                    <div className="filter-section">
                                        <h3 className="filter-section-title">Обмеження використання</h3>
                                        <div className="filter-chips">
                                            {refData.usageRestrictions.map(res => (
                                                <div
                                                    key={res.id}
                                                    className={`filter-chip ${(filters.usageRestriction || []).includes(res.id) ? 'selected' : ''}`}
                                                    onClick={() => handleOptionToggle('usageRestriction', res.id)}
                                                >
                                                    {res.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Licence Type */}
                                {refData?.licenceTypes && (
                                    <div className="filter-section">
                                        <h3 className="filter-section-title">Тип ліцензії</h3>
                                        <div className="filter-chips">
                                            {refData.licenceTypes.map(lc => (
                                                <div
                                                    key={lc.id}
                                                    className={`filter-chip ${(filters.licenceType || []).includes(lc.id) ? 'selected' : ''}`}
                                                    onClick={() => handleOptionToggle('licenceType', lc.id)}
                                                >
                                                    {lc.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Target Audience */}
                                {refData?.targetAudiences && (
                                    <div className="filter-section">
                                        <h3 className="filter-section-title">Цільова аудиторія</h3>
                                        <div className="filter-chips">
                                            {refData.targetAudiences.map(aud => (
                                                <div
                                                    key={aud.id}
                                                    className={`filter-chip ${(filters.targetAudience || []).includes(aud.id) ? 'selected' : ''}`}
                                                    onClick={() => handleOptionToggle('targetAudience', aud.id)}
                                                >
                                                    {aud.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Keywords */}
                                {refData?.keywords && (
                                    <div className="filter-section">
                                        <h3 className="filter-section-title">Ключові слова</h3>
                                        <div className="filter-chips keywords-filter">
                                            {refData.keywords.map(kw => (
                                                <div
                                                    key={kw.id}
                                                    className={`filter-chip ${(filters.keywords || []).includes(kw.id) ? 'selected' : ''}`}
                                                    onClick={() => handleOptionToggle('keywords', kw.id)}
                                                >
                                                    #{kw.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}