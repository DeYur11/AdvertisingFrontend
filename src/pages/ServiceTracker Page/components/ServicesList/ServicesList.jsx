// src/pages/ServiceTrackerPage/components/ServicesList/ServicesList.jsx
import React from "react";
import Card from "../../../../components/common/Card/Card";
import ServiceCard from "../ServiceCard/ServiceCard";
import "./ServicesList.css";

const uk = {
    loading: "Завантаження сервісів...",
    errorPrefix: "Помилка завантаження сервісів: ",
    noServices: "Сервіси, що відповідають критеріям пошуку, відсутні.",
    allImplemented: "Усі сервіси повністю реалізовані.",
    sortBy: "Сортувати за:",
    estCost: "Орієнтовна вартість",
    project: "Проєкт",
};

export default function ServicesList({
                                         services,
                                         loading,
                                         error,
                                         onCreateService,
                                         onViewDetails,
                                         filters,
                                         onSort,
                                         sortConfig = {
                                             field: "projectName",
                                             direction: "ASC",
                                         },
                                     }) {
    // Обробка кліку по кнопці сортування
    const handleSortClick = (field) => {
        if (onSort) {
            onSort(field);
        }
    };

    // Визначення стрілки напрямку сортування
    const getSortArrow = (field) => {
        if (sortConfig.field === field) {
            return sortConfig.direction === "ASC" ? "↑" : "↓";
        }
        return null;
    };

    if (loading) {
        return <div className="loading-message">{uk.loading}</div>;
    }

    if (error) {
        return (
            <div className="error-message">
                {uk.errorPrefix}
                {error.message}
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <Card className="empty-state-card">
                <div className="no-services-message">
                    {filters.searchQuery || filters.projectFilter
                        ? uk.noServices
                        : uk.allImplemented}
                </div>
            </Card>
        );
    }

    return (
        <div className="services-list-container">
            {/* Елементи керування сортуванням */}
            <div className="sort-controls">
                <span className="sort-label">{uk.sortBy}</span>

                <button
                    className={`sort-button ${
                        sortConfig.field === "serviceEstimateCost" ? "active" : ""
                    }`}
                    onClick={() => handleSortClick("serviceEstimateCost")}
                >
                    {uk.estCost} {getSortArrow("serviceEstimateCost")}
                </button>
                <button
                    className={`sort-button ${
                        sortConfig.field === "projectName" ? "active" : ""
                    }`}
                    onClick={() => handleSortClick("projectName")}
                >
                    {uk.project} {getSortArrow("projectName")}
                </button>
            </div>

            {/* Сітка сервісів */}
            <div className="services-grid">
                {services.map((service) => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onCreateService={onCreateService}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        </div>
    );
}
