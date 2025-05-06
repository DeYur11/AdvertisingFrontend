// src/pages/ServiceTracker/ServiceTracker.jsx
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import {
    GET_PAGINATED_PROJECT_SERVICES,
    GET_PROJECTS_WITH_SERVICES,
    GET_SERVICE_TYPES,
    GET_PROJECT_STATUSES,
    GET_PROJECT_TYPES,
    GET_CLIENTS,
    GET_MANAGERS,
    GET_SERVICE_STATUSES
} from "./graphql/queries";
import {
    ServiceTrackerHeader,
    ServiceFilterPanel,
    ServicesList,
    CreateServiceModal,
    ServiceDetailsModal,
    ProjectGroupView
} from "./components";
import Pagination from "../../components/common/Pagination/Pagination";
import "./ServiceTracker.css";

export default function ServiceTracker() {
    // Pagination state
    const [pagination, setPagination] = useState({
        page: 0, // GraphQL uses 0-based indexing for pages
        size: 10,
        sortField: "projectName",
        sortDirection: "ASC"
    });

    // Service state
    const [selectedService, setSelectedService] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
        onlyMismatched: true,
        searchQuery: "",
        groupByProject: false,
        serviceTypeIds: [],
        projectStatusIds: [],
        projectTypeIds: [],
        clientIds: [],
        managerIds: [],
        serviceInProgressStatusIds: [],
        dateRange: {
            startDateFrom: null,
            startDateTo: null,
            endDateFrom: null,
            endDateTo: null
        },
        costRange: {
            costMin: null,
            costMax: null
        }
    });

    // Convert filters to GraphQL input format
    const getGraphQLFilters = () => {
        const gqlFilters = {
            onlyMismatched: filters.onlyMismatched
        };

        if (filters.searchQuery) {
            gqlFilters.serviceNameContains = filters.searchQuery;
            gqlFilters.projectNameContains = filters.searchQuery;
        }

        if (filters.serviceTypeIds.length > 0) {
            gqlFilters.serviceTypeIds = filters.serviceTypeIds;
        }

        if (filters.projectStatusIds.length > 0) {
            gqlFilters.statusIds = filters.projectStatusIds;
        }

        if (filters.projectTypeIds.length > 0) {
            gqlFilters.projectTypeIds = filters.projectTypeIds;
        }

        if (filters.clientIds.length > 0) {
            gqlFilters.clientIds = filters.clientIds;
        }

        if (filters.managerIds.length > 0) {
            gqlFilters.managerIds = filters.managerIds;
        }

        if (filters.serviceInProgressStatusIds.length > 0) {
            gqlFilters.serviceInProgressStatusIds = filters.serviceInProgressStatusIds;
        }

        // Date ranges
        if (filters.dateRange.startDateFrom) {
            gqlFilters.startDateFrom = filters.dateRange.startDateFrom;
        }

        if (filters.dateRange.startDateTo) {
            gqlFilters.startDateTo = filters.dateRange.startDateTo;
        }

        if (filters.dateRange.endDateFrom) {
            gqlFilters.endDateFrom = filters.dateRange.endDateFrom;
        }

        if (filters.dateRange.endDateTo) {
            gqlFilters.endDateTo = filters.dateRange.endDateTo;
        }

        // Cost ranges
        if (filters.costRange.costMin) {
            gqlFilters.costMin = parseFloat(filters.costRange.costMin);
        }

        if (filters.costRange.costMax) {
            gqlFilters.costMax = parseFloat(filters.costRange.costMax);
        }

        return gqlFilters;
    };

    // Reset pagination when filters change
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            page: 0 // Reset to first page when filters change
        }));
    }, [filters]);

    // Fetch reference data for filters
    const { data: serviceTypesData } = useQuery(GET_SERVICE_TYPES);
    const { data: projectStatusesData } = useQuery(GET_PROJECT_STATUSES);
    const { data: projectTypesData } = useQuery(GET_PROJECT_TYPES);
    const { data: clientsData } = useQuery(GET_CLIENTS);
    const { data: managersData } = useQuery(GET_MANAGERS);
    const { data: serviceStatusesData } = useQuery(GET_SERVICE_STATUSES);

    // Prepare reference data for filters
    const filterOptions = {
        serviceTypes: serviceTypesData?.serviceTypes || [],
        projectStatuses: projectStatusesData?.projectStatuses || [],
        projectTypes: projectTypesData?.projectTypes || [],
        clients: clientsData?.clients || [],
        managers: managersData?.managers || [],
        serviceStatuses: serviceStatusesData?.serviceInProgressStatuses || []
    };

    // Fetch paginated services data
    const {
        data: servicesData,
        loading: servicesLoading,
        error: servicesError,
        refetch: refetchServices
    } = useQuery(GET_PAGINATED_PROJECT_SERVICES, {
        variables: {
            input: {
                page: pagination.page,
                size: pagination.size,
                sortField: pagination.sortField,
                sortDirection: pagination.sortDirection,
                filter: getGraphQLFilters()
            }
        },
        skip: filters.groupByProject,
        fetchPolicy: "network-only"
    });

    // Fetch project data for grouped view
    const {
        data: projectsData,
        loading: projectsLoading,
        error: projectsError,
        refetch: refetchProjects
    } = useQuery(GET_PROJECTS_WITH_SERVICES, {
        skip: !filters.groupByProject,
        fetchPolicy: "network-only"
    });

    // Determine loading and error states
    const loading = filters.groupByProject ? projectsLoading : servicesLoading;
    const error = filters.groupByProject ? projectsError : servicesError;

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            page: newPage - 1 // Convert to 0-based indexing
        }));
    };

    // Handle page size change
    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({
            ...prev,
            size: newSize,
            page: 0 // Reset to first page when changing page size
        }));
    };

    // Handle sort change
    const handleSortChange = (field) => {
        setPagination(prev => {
            // If clicking the same field, toggle direction
            const newDirection = prev.sortField === field && prev.sortDirection === "ASC" ? "DESC" : "ASC";

            return {
                ...prev,
                sortField: field,
                sortDirection: newDirection
            };
        });
    };

    // Handle service creation and details
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

    // Handle data refresh
    const handleRefresh = () => {
        if (filters.groupByProject) {
            refetchProjects();
        } else {
            refetchServices();
        }
    };

    // Extract data for rendering
    const paginatedServices = servicesData?.paginatedProjectServices?.content || [];
    const pageInfo = servicesData?.paginatedProjectServices?.pageInfo;
    const projects = projectsData?.projects || [];

    // Calculate total number of pages for pagination
    const totalPages = pageInfo?.totalPages || 1;
    const totalItems = pageInfo?.totalElements || 0;

    return (
        <div className="service-tracker-container">
            <ServiceTrackerHeader />

            <ServiceFilterPanel
                filters={filters}
                setFilters={setFilters}
                onRefresh={handleRefresh}
                filterOptions={filterOptions}
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
                <>
                    <ServicesList
                        services={paginatedServices}
                        loading={loading}
                        error={error}
                        onCreateService={handleCreateServiceClick}
                        onViewDetails={handleViewServiceDetails}
                        filters={filters}
                        onSort={handleSortChange}
                        sortConfig={{
                            field: pagination.sortField,
                            direction: pagination.sortDirection
                        }}
                    />

                    {/* Pagination component */}
                    {!loading && !error && (
                        <Pagination
                            currentPage={pagination.page + 1} // Convert to 1-based for UI
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            pageSize={pagination.size}
                            onPageSizeChange={handlePageSizeChange}
                            totalItems={totalItems}
                            pageSizeOptions={[10, 20, 50, 100]}
                        />
                    )}
                </>
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