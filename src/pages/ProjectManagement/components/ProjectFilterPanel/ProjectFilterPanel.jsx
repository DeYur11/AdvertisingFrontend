import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import "./ProjectFilterPanel.css";

// GraphQL запит для отримання довідкових даних фільтрів
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
        users: workersByPosition(position: "Project Manager") {
            id
            name
            surname
        }
    }
`;

export default function ProjectFilterPanel({
                                               searchQuery,
                                               setSearchQuery,
                                               filters = {},
                                               setFilters,
                                               expanded,
                                               setExpanded,
                                               onSortChange,
                                               currentSortField = "name",
                                               currentSortDirection = "ASC"
                                           }) {
    // Локальний стан для кількості активних фільтрів
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const [clientSearchQuery, setClientSearchQuery] = useState("");
    const [managerSearchQuery, setManagerSearchQuery] = useState("");

    // Отримання довідкових даних з сервера
    const { data: refData, loading } = useQuery(GET_FILTER_REFERENCE_DATA);

    // Оновлення лічильника активних фільтрів при зміні filters
    useEffect(() => {
        let count = 0;
        Object.keys(filters).forEach(key => {
            if (Array.isArray(filters[key]) && filters[key].length > 0) count++;
            else if (typeof filters[key] === 'object' && filters[key] !== null) count++;
            else if (filters[key]) count++;
        });
        setActiveFilterCount(count);
    }, [filters]);

    // Застосування зміни фільтра
    const applyFilter = (filterType, value) => {
        const newFilters = { ...filters };
        if (Array.isArray(value)) {
            if (value.length === 0) delete newFilters[filterType];
            else newFilters[filterType] = value;
        } else if (filterType === 'date') {
            if (!value.from && !value.to) delete newFilters[filterType];
            else newFilters[filterType] = value;
        } else if (filterType === 'cost') {
            if (!value.min && !value.max) delete newFilters[filterType];
            else newFilters[filterType] = value;
        } else {
            if (!value) delete newFilters[filterType];
            else newFilters[filterType] = value;
        }
        setFilters(newFilters);
    };

    // Переключення опцій у мультивиборі
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

    // Зміна діапазону дат
    const handleDateChange = (type, value) => {
        const currentDate = filters.date || {};
        applyFilter('date', { ...currentDate, [type]: value });
    };

    // Зміна діапазону вартості
    const handleCostChange = (type, value) => {
        const currentCost = filters.cost || {};
        applyFilter('cost', { ...currentCost, [type]: value ? parseFloat(value) : null });
    };

    // Скидання всіх фільтрів
    const handleResetFilters = () => {
        setFilters({});
        setSearchQuery("");
        setClientSearchQuery("");
        setManagerSearchQuery("");
    };

    // Швидкі фільтри за датою
    const applyQuickDateFilter = (days) => {
        const today = new Date();
        const targetDate = new Date();
        if (days === 'overdue') {
            applyFilter('date', { from: null, to: today.toISOString().split('T')[0] });
        } else if (days === 'active') {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 7);
            applyFilter('date', { from: pastDate.toISOString().split('T')[0], to: null });
        } else {
            targetDate.setDate(today.getDate() + days);
            applyFilter('date', { from: today.toISOString().split('T')[0], to: targetDate.toISOString().split('T')[0] });
        }
    };

    // Зміна сортування
    const handleSortChange = (field) => {
        if (field === currentSortField) {
            onSortChange(field, currentSortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            onSortChange(field, 'ASC');
        }
    };

    // Отримати відфільтрованих клієнтів
    const getSortedClients = () => {
        if (!refData?.clients) return [];
        const sortedClients = [...refData.clients].sort((a, b) => a.name.localeCompare(b.name));
        if (clientSearchQuery) {
            return sortedClients.filter(c => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()));
        }
        return sortedClients;
    };

    // Отримати відфільтрованих менеджерів
    const getSortedManagers = () => {
        if (!refData?.users) return [];
        const sorted = [...refData.users].sort((a, b) => a.name.localeCompare(b.name));
        if (managerSearchQuery) {
            return sorted.filter(m => `${m.name} ${m.surname}`.toLowerCase().includes(managerSearchQuery.toLowerCase()));
        }
        return sorted;
    };

    // Індикатор сортування
    const renderSortIndicator = (field) => {
        if (field !== currentSortField) return null;
        return <span className="sort-indicator">{currentSortDirection === 'ASC' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="project-filter-panel-container">
            <div className="filter-bar">
                <div className="filter-actions">
                    <Button
                        variant={expanded ? 'primary' : 'outline'}
                        size="small"
                        icon={expanded ? '🔽' : '🔍'}
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
                        placeholder="Пошук проєктів за назвою чи описом..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Пошук проєктів"
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery("")} aria-label="Очистити пошук">✕</button>
                    )}
                </div>

                <div className="sort-controls">
                    <span className="sort-label">Сортувати за:</span>
                    <div className="sort-options">
                        <button className={`sort-option ${currentSortField === 'name' ? 'active' : ''}`}
                                onClick={() => handleSortChange('name')}>Ім'я {renderSortIndicator('name')}</button>
                        <button className={`sort-option ${currentSortField === 'startDate' ? 'active' : ''}`}
                                onClick={() => handleSortChange('startDate')}>Дата
                            початку {renderSortIndicator('startDate')}</button>
                        <button className={`sort-option ${currentSortField === 'registrationDate' ? 'active' : ''}`}
                                onClick={() => handleSortChange('registrationDate')}>Дата
                            реєстрації {renderSortIndicator('registrationDate')}</button>
                        <button className={`sort-option ${currentSortField === 'cost' ? 'active' : ''}`}
                                onClick={() => handleSortChange('cost')}>Вартість {renderSortIndicator('cost')}</button>
                        <button className={`sort-option ${currentSortField === 'estimateCost' ? 'active' : ''}`}
                                onClick={() => handleSortChange('estimateCost')}>Орієнтовна
                            вартість {renderSortIndicator('estimateCost')}</button>
                    </div>
                </div>
            </div>

            {activeFilterCount > 0 && (
                <div className="active-filters-display">
                    <div className="active-filters-label">Активні фільтри:</div>
                    <div className="active-filters-list">
                        {filters.status?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Статус:</span>
                                <span className="filter-value">{filters.status.length} вибрано</span>
                                <button className="remove-filter" onClick={()=>applyFilter('status',[])} aria-label="Видалити фільтр статусу">✕</button>
                            </div>
                        )}
                        {filters.projectType?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Тип проєкту:</span>
                                <span className="filter-value">{filters.projectType.length} вибрано</span>
                                <button className="remove-filter" onClick={()=>applyFilter('projectType',[])} aria-label="Видалити фільтр типу">✕</button>
                            </div>
                        )}
                        {filters.date && (
                            <div className="active-filter">
                                <span className="filter-name">Діапазон дат:</span>
                                <span className="filter-value">
                                    {filters.date.from && `Від: ${new Date(filters.date.from).toLocaleDateString()}`}
                                    {filters.date.from && filters.date.to && ' - '}
                                    {filters.date.to && `До: ${new Date(filters.date.to).toLocaleDateString()}`}
                                </span>
                                <button className="remove-filter" onClick={()=>applyFilter('date',{})} aria-label="Видалити фільтр дат">✕</button>
                            </div>
                        )}
                        {filters.cost && (
                            <div className="active-filter">
                                <span className="filter-name">Діапазон вартості:</span>
                                <span className="filter-value">
                                    {filters.cost.min !== undefined && `Мін: $${filters.cost.min}`}
                                    {filters.cost.min !== undefined && filters.cost.max !== undefined && ' - '}
                                    {filters.cost.max !== undefined && `Макс: $${filters.cost.max}`}
                                </span>
                                <button className="remove-filter" onClick={()=>applyFilter('cost',{})} aria-label="Видалити фільтр вартості">✕</button>
                            </div>
                        )}
                        {filters.clientId?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Клієнт:</span>
                                <span className="filter-value">{filters.clientId.length} вибрано</span>
                                <button className="remove-filter" onClick={()=>applyFilter('clientId',[])} aria-label="Видалити фільтр клієнта">✕</button>
                            </div>
                        )}
                        {filters.managerId?.length > 0 && (
                            <div className="active-filter">
                                <span className="filter-name">Менеджер:</span>
                                <span className="filter-value">{filters.managerId.length} вибрано</span>
                                <button className="remove-filter" onClick={()=>applyFilter('managerId',[])} aria-label="Видалити фільтр менеджера">✕</button>
                            </div>
                        )}
                    </div>
                    <Button variant="outline" size="small" className="clear-filters-btn" onClick={handleResetFilters}>Скинути все</Button>
                </div>
            )}

            {expanded && (
                <Card className="advanced-filters-panel">
                    <div className="filters-content">
                        {loading ? (
                            <div className="loading-filters">Завантаження опцій фільтрів...</div>
                        ) : (
                            <>
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Статус проєкту</h3>
                                    <div className="filter-chips">
                                        {refData?.projectStatuses.map(status => (
                                            <div key={status.id} className={`filter-chip ${(filters.status||[]).includes(status.id)?'selected':''}`} onClick={()=>handleOptionToggle('status', status.id)}>{status.name}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Тип проєкту</h3>
                                    <div className="filter-chips">
                                        {refData?.projectTypes.map(type => (
                                            <div key={type.id} className={`filter-chip ${(filters.projectType||[]).includes(type.id)?'selected':''}`} onClick={()=>handleOptionToggle('projectType', type.id)}>{type.name}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Діапазон дат</h3>
                                    <div className="date-filter-grid">
                                        <div className="date-inputs">
                                            <div className="date-range-input"><label>Від:</label><input type="date" value={filters.date?.from||""} onChange={e=>handleDateChange('from', e.target.value)}/></div>
                                            <div className="date-range-input"><label>До:</label><input type="date" value={filters.date?.to||""} onChange={e=>handleDateChange('to', e.target.value)}/></div>
                                        </div>
                                        <div className="quick-date-filters">
                                            <Button size="small" variant="outline" onClick={()=>applyQuickDateFilter('active')}>Активні проєкти</Button>
                                            <Button size="small" variant="outline" onClick={()=>applyQuickDateFilter(30)}>Наступні 30 днів</Button>
                                            <Button size="small" variant="outline" onClick={()=>applyQuickDateFilter('overdue')}>Протерміновані</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Діапазон вартості</h3>
                                    <div className="cost-filter-grid">
                                        <div className="cost-inputs">
                                            <div className="cost-range-input"><label>Мін:</label><div className="input-with-prefix"><span className="input-prefix">$</span><input type="number" value={filters.cost?.min||""} onChange={e=>handleCostChange('min', e.target.value)} placeholder="0"/></div></div>
                                            <div className="cost-range-input"><label>Макс:</label><div className="input-with-prefix"><span className="input-prefix">$</span><input type="number" value={filters.cost?.max||""} onChange={e=>handleCostChange('max', e.target.value)} placeholder="∞"/></div></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Клієнт</h3>
                                    <div className="client-search-container"><input type="text" className="client-search-input" placeholder="Пошук клієнтів..." value={clientSearchQuery} onChange={e=>setClientSearchQuery(e.target.value)} aria-label="Пошук клієнтів"/>{clientSearchQuery&&(<button className="clear-client-search" onClick={()=>setClientSearchQuery("")} aria-label="Очистити пошук клієнтів">✕</button>)}</div>
                                    <div className="client-list">{getSortedClients().map(client=>(<div key={client.id} className={`client-item ${(filters.clientId||[]).includes(client.id)?'selected':''}`} onClick={()=>handleOptionToggle('clientId', client.id)}>{client.name}{(filters.clientId||[]).includes(client.id)&&(<span className="client-selected-check">✓</span>)}</div>))}{getSortedClients().length===0&&(<div className="no-clients-found">Клієнтів не знайдено</div>)}</div>
                                </div>
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Менеджер проєкту</h3>
                                    <div className="manager-search-container"><input type="text" className="manager-search-input" placeholder="Пошук менеджерів..." value={managerSearchQuery} onChange={e=>setManagerSearchQuery(e.target.value)} aria-label="Пошук менеджерів"/>{managerSearchQuery&&(<button className="clear-manager-search" onClick={()=>setManagerSearchQuery("")} aria-label="Очистити пошук менеджерів">✕</button>)}</div>
                                    <div className="manager-list">{getSortedManagers().map(manager=>(<div key={manager.id} className={`manager-item ${(filters.managerId||[]).includes(manager.id)?'selected':''}`} onClick={()=>handleOptionToggle('managerId', manager.id)}>{manager.name} {manager.surname}{(filters.managerId||[]).includes(manager.id)&&(<span className="manager-selected-check">✓</span>)}</div>))}{getSortedManagers().length===0&&(<div className="no-managers-found">Менеджерів не знайдено</div>)}</div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
