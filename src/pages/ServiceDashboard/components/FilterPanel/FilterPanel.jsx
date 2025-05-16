// src/pages/ServiceDashboard/components/FilterPanel/FilterPanel.jsx
import { useState } from "react";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import "./FilterPanel.css";

export default function FilterPanel({
                                        filters,
                                        onFilterChange,
                                        serviceTypes = []
                                    }) {
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || "",
        serviceType: filters.serviceType || "",
        costMin: filters.costMin || "",
        costMax: filters.costMax || ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    const resetFilters = () => {
        const emptyFilters = {
            search: "",
            serviceType: "",
            costMin: "",
            costMax: ""
        };
        setLocalFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    return (
        <Card className="filter-panel">
            <div className="filter-header">
                <h2>Фільтри</h2>
            </div>

            <div className="filter-content">
                <div className="filter-row">
                    <div className="filter-group">
                        <label htmlFor="search">Пошук</label>
                        <input
                            id="search"
                            name="search"
                            type="text"
                            value={localFilters.search}
                            onChange={handleInputChange}
                            placeholder="Пошук за назвою послуги..."
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="serviceType">Тип послуги</label>
                        <select
                            id="serviceType"
                            name="serviceType"
                            value={localFilters.serviceType}
                            onChange={handleInputChange}
                            className="filter-input"
                        >
                            <option value="">Усі типи</option>
                            {serviceTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="filter-row">
                    <div className="filter-group">
                        <label htmlFor="costMin">Мін. вартість (₴)</label>
                        <input
                            id="costMin"
                            name="costMin"
                            type="number"
                            value={localFilters.costMin}
                            onChange={handleInputChange}
                            placeholder="Мінімум"
                            className="filter-input"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="costMax">Макс. вартість (₴)</label>
                        <input
                            id="costMax"
                            name="costMax"
                            type="number"
                            value={localFilters.costMax}
                            onChange={handleInputChange}
                            placeholder="Максимум"
                            className="filter-input"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>
            </div>

            <div className="service-filter-actions">
                <Button
                    variant="outline"
                    onClick={resetFilters}
                >
                    Скинути
                </Button>
                <Button
                    variant="primary"
                    onClick={applyFilters}
                >
                    Застосувати фільтри
                </Button>
            </div>
        </Card>
    );
}
