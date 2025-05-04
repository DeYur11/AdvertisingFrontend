// src/pages/ServiceTracker/components/ServicesList/ServicesList.jsx
import Card from "../../../../components/common/Card/Card";
import ServiceCard from "../ServiceCard/ServiceCard";
import "./ServicesList.css";

export default function ServicesList({ services, loading, error, onCreateService, filters }) {
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
        <div className="services-grid">
            {services.map(service => (
                <ServiceCard
                    key={service.id}
                    service={service}
                    onCreateService={onCreateService}
                />
            ))}
        </div>
    );
}