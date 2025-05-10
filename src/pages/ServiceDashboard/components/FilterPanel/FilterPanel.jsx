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
                <h2>Filters</h2>
            </div>

            <div className="filter-content">
                <div className="filter-row">
                    <div className="filter-group">
                        <label htmlFor="search">Search</label>
                        <input
                            id="search"
                            name="search"
                            type="text"
                            value={localFilters.search}
                            onChange={handleInputChange}
                            placeholder="Search by service name..."
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="serviceType">Service Type</label>
                        <select
                            id="serviceType"
                            name="serviceType"
                            value={localFilters.serviceType}
                            onChange={handleInputChange}
                            className="filter-input"
                        >
                            <option value="">All Types</option>
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
                        <label htmlFor="costMin">Min Cost ($)</label>
                        <input
                            id="costMin"
                            name="costMin"
                            type="number"
                            value={localFilters.costMin}
                            onChange={handleInputChange}
                            placeholder="Minimum"
                            className="filter-input"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="costMax">Max Cost ($)</label>
                        <input
                            id="costMax"
                            name="costMax"
                            type="number"
                            value={localFilters.costMax}
                            onChange={handleInputChange}
                            placeholder="Maximum"
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
                    Reset
                </Button>
                <Button
                    variant="primary"
                    onClick={applyFilters}
                >
                    Apply Filters
                </Button>
            </div>
        </Card>
    );
}