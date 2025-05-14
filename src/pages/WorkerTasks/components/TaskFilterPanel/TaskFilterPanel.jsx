import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import "./TaskFilterPanel.css";

// GraphQL запит для довідкових даних
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
    // Отримання довідкових даних
    const { data: refData, loading } = useQuery(GET_FILTER_REFERENCE_DATA);

    // Локальний стан для відстеження кількості активних фільтрів та пошуку клієнтів
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const [clientSearchQuery, setClientSearchQuery] = useState("");

    // Оновлення кількості активних фільтрів при зміні фільтрів
    useEffect(() => {
        let count = 0;

        // Підрахунок statusIds
        if (filters.statusIds?.length > 0) count++;

        // Підрахунок priorityIn
        if (filters.priorityIn?.length > 0) count++;

        // Підрахунок діапазону дат дедлайну
        if (filters.deadlineFrom || filters.deadlineTo) count++;

        // Підрахунок nameContains (пошук)
        if (filters.nameContains) count++;

        // Підрахунок serviceInProgressIds
        if (filters.serviceInProgressIds?.length > 0) count++;

        // Підрахунок інших діапазонів дат
        if (filters.startDateFrom || filters.startDateTo) count++;
        if (filters.endDateFrom || filters.endDateTo) count++;
        if (filters.createdFrom || filters.createdTo) count++;

        setActiveFilterCount(count);
    }, [filters]);

    // Обробка змін фільтрів
    const applyFilter = (key, value) => {
        // Створення нового об'єкта фільтрів
        const updatedFilters = { ...filters };

        // Обробка фільтрів типу масив
        if (Array.isArray(value)) {
            if (value.length === 0) {
                delete updatedFilters[key];
            } else {
                updatedFilters[key] = value;
            }
        }
        // Обробка діапазонів дат
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
        // Обробка простих фільтрів зі значеннями
        else {
            if (!value && value !== 0) {
                delete updatedFilters[key];
            } else {
                updatedFilters[key] = value;
            }
        }

        onFiltersChange(updatedFilters);
    };

    // Обробка перемикання ID статусу у фільтрі
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

    // Обробка перемикання значення пріоритету у фільтрі
    const handlePriorityToggle = (priorityLevel) => {
        const currentPriorities = filters.priorityIn || [];
        let newPriorities;

        // Відображення рівнів пріоритету на фактичні значення пріоритету
        const priorityRanges = {
            "high": [8, 9, 10],
            "medium": [4, 5, 6, 7],
            "low": [1, 2, 3]
        };

        const allPriorities = priorityRanges[priorityLevel] || [];

        // Перевірка, чи всі пріоритети цього рівня вже вибрані
        const allSelected = allPriorities.every(p => currentPriorities.includes(p));

        if (allSelected) {
            // Якщо всі вибрані, видаляємо їх усі
            newPriorities = currentPriorities.filter(p => !allPriorities.includes(p));
        } else {
            // Якщо не всі вибрані, додаємо відсутні
            newPriorities = [
                ...currentPriorities.filter(p => !allPriorities.includes(p)),
                ...allPriorities
            ];
        }

        applyFilter('priorityIn', newPriorities);
    };

    // Обробка змін дат дедлайну
    const handleDateChange = (type, value) => {
        applyFilter(type, value);
    };

    // Застосування швидких фільтрів дат
    const applyQuickDateFilter = (days) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        if (days === 'overdue') {
            // Для прострочених, встановлюємо deadlineTo на сьогодні
            applyFilter('deadlineTo', todayStr);
            applyFilter('deadlineFrom', null);
        } else {
            // Для майбутніх дат
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + days);
            const targetStr = targetDate.toISOString().split('T')[0];

            applyFilter('deadlineFrom', todayStr);
            applyFilter('deadlineTo', targetStr);
        }
    };

    // Обробка змін сортування
    const handleSortChange = (field) => {
        if (field === currentSortField) {
            // Перемикання напрямку при натисканні на те саме поле
            onSortChange(field, currentSortDirection === "ASC" ? "DESC" : "ASC");
        } else {
            // За замовчуванням ASC для нового поля (окрім CREATE_DATETIME, яке за замовчуванням DESC)
            const defaultDirection = field === "CREATE_DATETIME" ? "DESC" : "ASC";
            onSortChange(field, defaultDirection);
        }
    };

    // Відображення індикатора сортування
    const renderSortIndicator = (field) => {
        if (field !== currentSortField) return null;
        return (
            <span className="sort-indicator">
                {currentSortDirection === "ASC" ? "↑" : "↓"}
            </span>
        );
    };

    // Визначення варіантів пріоритету
    const priorityOptions = [
        { value: "high", label: "Високий (8-10)", class: "priority-high" },
        { value: "medium", label: "Середній (4-7)", class: "priority-medium" },
        { value: "low", label: "Низький (1-3)", class: "priority-low" }
    ];

    // Отримання списку клієнтів з фільтрацією пошуку
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

    // Перевірка, чи вибрано рівень пріоритету (частково або повністю)
    const isPrioritySelected = (priorityLevel) => {
        const currentPriorities = filters.priorityIn || [];
        const priorityRanges = {
            "high": [8, 9, 10],
            "medium": [4, 5, 6, 7],
            "low": [1, 2, 3]
        };

        // Перевірка, чи вибрано будь-який пріоритет цього рівня
        return priorityRanges[priorityLevel].some(p => currentPriorities.includes(p));
    };

    return (
        <div className="task-filter-panel-container">
            {/* Рядок пошуку та основних фільтрів */}
            <div className="task-filter-bar">
                <div className="filter-actions">
                    <div className="filter-buttons">
                        <Button
                            variant={viewMode === "active" ? "primary" : "outline"}
                            size="small"
                            onClick={() => onViewModeChange("active")}
                            className="filter-button"
                        >
                            Активні завдання
                        </Button>
                        <Button
                            variant={viewMode === "all" ? "primary" : "outline"}
                            size="small"
                            onClick={() => onViewModeChange("all")}
                            className="filter-button"
                        >
                            Всі завдання
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
                        placeholder="Пошук за назвою завдання..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Пошук завдань"
                    />
                    {searchQuery && (
                        <button
                            className="clear-search"
                            onClick={() => onSearchChange("")}
                            aria-label="Очистити пошук"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Елементи керування сортуванням */}
                <div className="sort-controls">
                    <span className="sort-label">Сортувати за:</span>
                    <div className="sort-options">
                        <button
                            className={`sort-option ${currentSortField === "NAME" ? "active" : ""}`}
                            onClick={() => handleSortChange("NAME")}
                        >
                            Назва {renderSortIndicator("NAME")}
                        </button>
                        <button
                            className={`sort-option ${currentSortField === "PRIORITY" ? "active" : ""}`}
                            onClick={() => handleSortChange("PRIORITY")}
                        >
                            Пріоритет {renderSortIndicator("PRIORITY")}
                        </button>
                        <button
                            className={`sort-option ${currentSortField === "DEADLINE" ? "active" : ""}`}
                            onClick={() => handleSortChange("DEADLINE")}
                        >
                            Дедлайн {renderSortIndicator("DEADLINE")}
                        </button>
                        <button
                            className={`sort-option ${currentSortField === "STATUS" ? "active" : ""}`}
                            onClick={() => handleSortChange("STATUS")}
                        >
                            Статус {renderSortIndicator("STATUS")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Відображення активних фільтрів */}
            {activeFilterCount > 0 && (
                <div className="active-filters-display">
                    <div className="active-filters-label">Активні фільтри:</div>
                    <div className="active-filters-list">
                        {filters.nameContains && (
                            <div className="active-filter">
                                <span className="filter-name">Пошук:</span>
                                <span className="filter-value">"{filters.nameContains}"</span>
                                <button
                                    className="remove-filter"
                                    onClick={() => onSearchChange("")}
                                    aria-label="Видалити фільтр пошуку"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.statusIds?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Статус:</span>
                                <span className="filter-value">
                                    {refData?.taskStatuses
                                        .filter(s => filters.statusIds.includes(s.id))
                                        .map(s => s.name)
                                        .join(', ')}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('statusIds', [])}
                                    aria-label="Видалити фільтр статусу"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {filters.priorityIn?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Пріоритет:</span>
                                <span className="filter-value">
                                    {filters.priorityIn.length} значень
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => applyFilter('priorityIn', [])}
                                    aria-label="Видалити фільтр пріоритету"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {(filters.deadlineFrom || filters.deadlineTo) && (
                            <div className="active-filter">
                                <span className="filter-name">Дедлайн:</span>
                                <span className="filter-value">
                                    {filters.deadlineFrom && `З: ${filters.deadlineFrom}`}
                                    {filters.deadlineFrom && filters.deadlineTo && ' - '}
                                    {filters.deadlineTo && `До: ${filters.deadlineTo}`}
                                </span>
                                <button
                                    className="remove-filter"
                                    onClick={() => {
                                        applyFilter('deadlineFrom', null);
                                        applyFilter('deadlineTo', null);
                                    }}
                                    aria-label="Видалити фільтр дедлайну"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Додайте тут інші активні фільтри за потреби */}
                    </div>

                    <Button
                        variant="outline"
                        size="small"
                        className="clear-filters-btn"
                        onClick={onClearAllFilters}
                    >
                        Очистити все
                    </Button>
                </div>
            )}

            {/* Розгорнута панель розширених фільтрів */}
            {expanded && (
                <Card className="advanced-filters-panel">
                    <div className="filters-content">
                        {loading ? (
                            <div className="loading-filters">Завантаження параметрів фільтрації...</div>
                        ) : (
                            <>
                                {/* Фільтри статусу завдання */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Статус завдання</h3>
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

                                {/* Фільтри пріоритету */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Пріоритет</h3>
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

                                {/* Фільтри дедлайну */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Дедлайн</h3>
                                    <div className="date-filter-grid">
                                        <div className="date-inputs">
                                            <div className="date-range-input">
                                                <label>З:</label>
                                                <input
                                                    type="date"
                                                    value={filters.deadlineFrom || ""}
                                                    onChange={(e) => handleDateChange("deadlineFrom", e.target.value)}
                                                />
                                            </div>
                                            <div className="date-range-input">
                                                <label>До:</label>
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
                                                Наступні 7 днів
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => applyQuickDateFilter(30)}
                                            >
                                                Наступні 30 днів
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => applyQuickDateFilter('overdue')}
                                            >
                                                Прострочені
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Тут можна додати більше фільтрів за потреби */}
                                {/* Наприклад: Фільтри дати початку, дати закінчення, типу послуги */}

                                {/* Розділ додаткових дат - може бути розширений */}
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Додаткові фільтри дат</h3>
                                    <div className="date-subsections">
                                        {/* Діапазон дати початку */}
                                        <div className="date-subsection">
                                            <h4 className="date-subsection-title">Дата початку</h4>
                                            <div className="date-inputs">
                                                <div className="date-range-input">
                                                    <label>З:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.startDateFrom || ""}
                                                        onChange={(e) => handleDateChange("startDateFrom", e.target.value)}
                                                    />
                                                </div>
                                                <div className="date-range-input">
                                                    <label>До:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.startDateTo || ""}
                                                        onChange={(e) => handleDateChange("startDateTo", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Діапазон дати закінчення */}
                                        <div className="date-subsection">
                                            <h4 className="date-subsection-title">Дата закінчення</h4>
                                            <div className="date-inputs">
                                                <div className="date-range-input">
                                                    <label>З:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.endDateFrom || ""}
                                                        onChange={(e) => handleDateChange("endDateFrom", e.target.value)}
                                                    />
                                                </div>
                                                <div className="date-range-input">
                                                    <label>До:</label>
                                                    <input
                                                        type="date"
                                                        value={filters.endDateTo || ""}
                                                        onChange={(e) => handleDateChange("endDateTo", e.target.value)}
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