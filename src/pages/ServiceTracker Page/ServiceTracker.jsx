// src/pages/ServiceTracker Page/ServiceTracker.jsx
// Оновлено з функціональністю експорту
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import {
    GET_PAGINATED_PROJECT_SERVICES,
    GET_SERVICE_TYPES,
    GET_PROJECT_STATUSES,
    GET_PROJECT_TYPES,
    GET_CLIENTS,
    GET_MANAGERS,
    GET_SERVICE_STATUSES
} from "./graphql/queries";
import {
    ServiceTrackerHeader,
    ServicesList,
    CreateServiceModal,
    ServiceDetailsModal,
    ProjectGroupView
} from "./components";
import ExportServiceModal from "./components/ExportServiceModal/ExportServiceModal";
import Pagination from "../../components/common/Pagination/Pagination";
import DynamicFilterPanel from "./components/ServiceFilterPanel/DynamicFilterPanel";
import Button from "../../components/common/Button/Button";
import "./ServiceTracker.css";

export default function ServiceTracker() {
    const renderHeader = () => {
        return (
            <div className="service-tracker-header">
                <ServiceTrackerHeader />
                <div className="header-actions">
                    <Button
                        variant="outline"
                        size="medium"
                        icon="📊"
                        onClick={() => setExportModalOpen(true)}
                    >
                        Експортувати дані
                    </Button>
                </div>
            </div>
        );
    };

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        sortField: "projectName",
        sortDirection: "ASC"
    });

    const [selectedService, setSelectedService] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);

    const [filters, setFilters] = useState({
        onlyMismatched: true,
        searchQuery: "",
        groupByProject: true,
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

    const getGraphQLFilters = () => {
        const gqlFilters = {
            onlyMismatched: filters.onlyMismatched
        };

        if (filters.searchQuery) {
            gqlFilters.serviceNameContains = filters.searchQuery;
            gqlFilters.projectNameContains = filters.searchQuery;
        }

        if (!filters.groupByProject) {
            if (filters.serviceTypeIds.length > 0) {
                gqlFilters.serviceTypeIds = filters.serviceTypeIds;
            }

            if (filters.serviceInProgressStatusIds.length > 0) {
                gqlFilters.serviceInProgressStatusIds = filters.serviceInProgressStatusIds;
            }

            if (filters.clientIds.length > 0) {
                gqlFilters.clientIds = filters.clientIds;
            }
        }

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

        if (filters.costRange.costMin) {
            gqlFilters.costMin = parseFloat(filters.costRange.costMin);
        }

        if (filters.costRange.costMax) {
            gqlFilters.costMax = parseFloat(filters.costRange.costMax);
        }

        return gqlFilters;
    };

    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            page: 0
        }));
    }, [filters]);

    const { data: serviceTypesData } = useQuery(GET_SERVICE_TYPES);
    const { data: projectStatusesData } = useQuery(GET_PROJECT_STATUSES);
    const { data: projectTypesData } = useQuery(GET_PROJECT_TYPES);
    const { data: clientsData } = useQuery(GET_CLIENTS);
    const { data: managersData } = useQuery(GET_MANAGERS);
    const { data: serviceStatusesData } = useQuery(GET_SERVICE_STATUSES);

    const filterOptions = {
        serviceTypes: serviceTypesData?.serviceTypes || [],
        projectStatuses: projectStatusesData?.projectStatuses || [],
        projectTypes: projectTypesData?.projectTypes || [],
        clients: clientsData?.clients || [],
        managers: managersData?.managers || [],
        serviceStatuses: serviceStatusesData?.serviceInProgressStatuses || []
    };

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

    const loading = servicesLoading;
    const error = servicesError;

    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            page: newPage - 1
        }));
    };

    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({
            ...prev,
            size: newSize,
            page: 0
        }));
    };

    const handleSortChange = (field) => {
        setPagination(prev => {
            const newDirection = prev.sortField === field && prev.sortDirection === "ASC" ? "DESC" : "ASC";
            return {
                ...prev,
                sortField: field,
                sortDirection: newDirection
            };
        });
    };

    const handleServiceCreated = () => {
        setShowCreateModal(false);
        refetchServices();
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
        refetchServices();
    };

    const paginatedServices = servicesData?.paginatedProjectServices?.content || [];
    const pageInfo = servicesData?.paginatedProjectServices?.pageInfo;
    const totalPages = pageInfo?.totalPages || 1;
    const totalItems = pageInfo?.totalElements || 0;

    return (
        <div className="service-tracker-container">
            {renderHeader()}

            <DynamicFilterPanel
                filters={filters}
                setFilters={setFilters}
                onRefresh={handleRefresh}
                filterOptions={filterOptions}
            />

            {filters.groupByProject ? (
                <ProjectGroupView
                    filters={filters}
                    onCreateService={handleCreateServiceClick}
                    onViewDetails={handleViewServiceDetails}
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

                    {!loading && !error && paginatedServices.length > 0 && (
                        <Pagination
                            currentPage={pagination.page + 1}
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

            {showCreateModal && selectedService && (
                <CreateServiceModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleServiceCreated}
                    projectService={selectedService}
                />
            )}

            {showDetailsModal && selectedService && (
                <ServiceDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    projectService={selectedService}
                    onCreateService={handleCreateServiceClick}
                />
            )}

            <ExportServiceModal
                isOpen={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
                filters={filters}
                currentSortField={pagination.sortField}
                currentSortDirection={pagination.sortDirection}
            />
        </div>
    );
}
