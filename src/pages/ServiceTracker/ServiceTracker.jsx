import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
    GET_ALL_PROJECT_SERVICES,
    GET_PROJECTS_WITH_SERVICES
} from "./graphql/queries";
import {
    ServiceTrackerHeader,
    ServiceFilterPanel,
    ServicesList,
    CreateServiceModal
} from "./components";
import ProjectGroupView from "./components/ProjectGroupView/ProjectGroupView";
import ServiceDetailsModal from "./components/ServiceDetailsModal/ServiceDetailsModal";
import "./ServiceTracker.css";

export default function ServiceTracker() {
    const [selectedService, setSelectedService] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filters, setFilters] = useState({
        onlyMismatched: true,
        searchQuery: "",
        groupByProject: false // New filter for grouping
    });

    // Fetch services data or projects data based on view mode
    const {
        data: servicesData,
        loading: servicesLoading,
        error: servicesError,
        refetch: refetchServices
    } = useQuery(GET_ALL_PROJECT_SERVICES, {
        skip: filters.groupByProject
    });

    const {
        data: projectsData,
        loading: projectsLoading,
        error: projectsError,
        refetch: refetchProjects
    } = useQuery(GET_PROJECTS_WITH_SERVICES, {
        skip: !filters.groupByProject
    });

    // Determine which loading and error states to use
    const loading = filters.groupByProject ? projectsLoading : servicesLoading;
    const error = filters.groupByProject ? projectsError : servicesError;

    // Handle filtering of services
    const getFilteredServices = () => {
        if (!servicesData || !servicesData.projectServices) return [];

        return servicesData.projectServices.filter(ps => {
            // Filter by search query (service name or project name)
            const matchesSearch = filters.searchQuery
                ? (ps.service.serviceName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                    ps.project.name.toLowerCase().includes(filters.searchQuery.toLowerCase()))
                : true;

            // Filter by mismatch if enabled
            const isMismatched = filters.onlyMismatched
                ? ps.amount > ps.servicesInProgress.length
                : true;

            return matchesSearch && isMismatched;
        });
    };

    const handleServiceCreated = () => {
        setShowCreateModal(false);
        if (filters.groupByProject) {
            refetchProjects();
        } else {
            refetchServices();
        }
    };

    const handleCreateServiceClick = (service) => {
        setSelectedService(service);
        setShowCreateModal(true);
    };

    const handleViewServiceDetails = (service) => {
        setSelectedService(service);
        setShowDetailsModal(true);
    };

    const handleRefresh = () => {
        if (filters.groupByProject) {
            refetchProjects();
        } else {
            refetchServices();
        }
    };

    // Get filtered data based on view mode
    const filteredServices = filters.groupByProject
        ? [] // We don't need this in project mode
        : getFilteredServices();

    const projects = projectsData?.projects || [];

    return (
        <div className="service-tracker-container">
            <ServiceTrackerHeader />

            <ServiceFilterPanel
                filters={filters}
                setFilters={setFilters}
                onRefresh={handleRefresh}
            />

            {/* Render either flat list or grouped by project */}
            {filters.groupByProject ? (
                <ProjectGroupView
                    projects={projects}
                    loading={loading}
                    error={error}
                    onCreateService={handleCreateServiceClick}
                    onViewDetails={handleViewServiceDetails}
                    filters={filters}
                />
            ) : (
                <ServicesList
                    services={filteredServices}
                    loading={loading}
                    error={error}
                    onCreateService={handleCreateServiceClick}
                    onViewDetails={handleViewServiceDetails}
                    filters={filters}
                />
            )}

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
