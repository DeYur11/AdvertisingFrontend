// src/pages/ServiceTracker/ServiceTracker.jsx
import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ALL_PROJECT_SERVICES } from "./graphql/queries";
import {
    ServiceTrackerHeader,
    ServiceFilterPanel,
    ServicesList,
    CreateServiceModal
} from "./components";
import ServiceDetailsModal from "./components/ServiceDetailsModal/ServiceDetailsModal";
import "./ServiceTracker.css";

export default function ServiceTracker() {
    const [selectedService, setSelectedService] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filters, setFilters] = useState({
        onlyMismatched: true,
        searchQuery: "",
        projectFilter: ""
    });

    // Fetch all project services
    const { data, loading, error, refetch } = useQuery(GET_ALL_PROJECT_SERVICES);

    // Handle filtering of services
    const getFilteredServices = () => {
        if (!data || !data.projectServices) return [];

        return data.projectServices.filter(ps => {
            // Filter by search query (service name or project name)
            const matchesSearch = filters.searchQuery
                ? (ps.service.serviceName.toLowerCase().includes(filters.searchQuery.toLowerCase())
                    || ps.project.name.toLowerCase().includes(filters.searchQuery.toLowerCase()))
                : true;

            // Filter by project name if specified
            const matchesProject = filters.projectFilter
                ? ps.project.name.toLowerCase().includes(filters.projectFilter.toLowerCase())
                : true;

            // Filter by mismatch if enabled
            const isMismatched = filters.onlyMismatched
                ? ps.amount > ps.servicesInProgress.length
                : true;

            return matchesSearch && matchesProject && isMismatched;
        });
    };

    const handleServiceCreated = () => {
        setShowCreateModal(false);
        refetch();
    };

    const handleCreateServiceClick = (service) => {
        setSelectedService(service);
        setShowCreateModal(true);
    };

    const handleViewServiceDetails = (service) => {
        setSelectedService(service);
        setShowDetailsModal(true);
    };

    const filteredServices = getFilteredServices();

    return (
        <div className="service-tracker-container">
            <ServiceTrackerHeader />

            <ServiceFilterPanel
                filters={filters}
                setFilters={setFilters}
            />

            <ServicesList
                services={filteredServices}
                loading={loading}
                error={error}
                onCreateService={handleCreateServiceClick}
                onViewDetails={handleViewServiceDetails}
                filters={filters}
            />

            {/* Create Service In Progress Modal with Tasks */}
            {showCreateModal && selectedService && (
                <CreateServiceModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleServiceCreated}
                    projectService={selectedService}
                />
            )}

            {/* Service Details Modal */}
            {showDetailsModal && selectedService && (
                <ServiceDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    projectService={selectedService}
                    onCreateService={handleCreateServiceClick}
                />
            )}
        </div>
    );
}