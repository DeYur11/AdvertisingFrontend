// src/pages/ServiceTracker/components/ServicesList/ServicesList.jsx
import Card from "../../../../components/common/Card/Card";
import ServiceCard from "../ServiceCard/ServiceCard";
import "./ServicesList.css";

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
                                             direction: "ASC"
                                         }
                                     }) {
    // Handle sorting clicks
    const handleSortClick = (field) => {
        if (onSort) {
            onSort(field);
        }
    };

    // Generate sort arrow indicator
    const getSortArrow = (field) => {
        if (sortConfig.field === field) {
            return sortConfig.direction === "ASC" ? "↑" : "↓";
        }
        return null;
    };

    if (loading) {
        return <div className="loading-message">Loading services...</div>;
    }

    if (error) {
        return <div className="error-message">Error loading services: {error.message}</div>;
    }

    if (services.length === 0) {
        return (
            <Card className="empty-state-card">
                <div className="no-services-message">
                    {filters.searchQuery || filters.projectFilter ?
                        "No services match your search criteria." :
                        "All services have been fully implemented."}
                </div>
            </Card>
        );
    }

    return (
        <div className="services-list-container">
            {/* Sort Controls */}
            <div className="sort-controls">
                <span className="sort-label">Sort by:</span>

                <button
                    className={`sort-button ${sortConfig.field === "serviceEstimateCost" ? "active" : ""}`}
                    onClick={() => handleSortClick("serviceEstimateCost")}
                >
                    Est. Cost {getSortArrow("serviceEstimateCost")}
                </button>
                <button
                    className={`sort-button ${sortConfig.field === "projectName" ? "active" : ""}`}
                    onClick={() => handleSortClick("projectName")}
                >
                    Project {getSortArrow("projectName")}
                </button>
            </div>

            {/* Services Grid */}
            <div className="services-grid">
                {services.map(service => (
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