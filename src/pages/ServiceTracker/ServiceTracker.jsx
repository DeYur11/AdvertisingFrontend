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
    ServiceFilterPanel,
    ServicesList,
    CreateServiceModal,
    ServiceDetailsModal,
    ProjectGroupView
} from "./components";
import Pagination from "../../components/common/Pagination/Pagination";
import "./ServiceTracker.css";

export default function ServiceTracker() {
    // Стан пагінації для сервісів
    const [pagination, setPagination] = useState({
        page: 0, // GraphQL використовує індексацію з 0
        size: 10,
        sortField: "projectName",
        sortDirection: "ASC"
    });

    // Стан для управління модальними вікнами сервісів
    const [selectedService, setSelectedService] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Стан фільтрів
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

    // Конвертація фільтрів у формат для GraphQL запиту
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

        // Діапазони дат
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

        // Діапазони вартості
        if (filters.costRange.costMin) {
            gqlFilters.costMin = parseFloat(filters.costRange.costMin);
        }

        if (filters.costRange.costMax) {
            gqlFilters.costMax = parseFloat(filters.costRange.costMax);
        }

        return gqlFilters;
    };

    // Скидання сторінки пагінації при зміні фільтрів
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            page: 0 // Скидаємо до першої сторінки при зміні фільтрів
        }));
    }, [filters]);

    // Отримання довідкових даних для фільтрів
    const { data: serviceTypesData } = useQuery(GET_SERVICE_TYPES);
    const { data: projectStatusesData } = useQuery(GET_PROJECT_STATUSES);
    const { data: projectTypesData } = useQuery(GET_PROJECT_TYPES);
    const { data: clientsData } = useQuery(GET_CLIENTS);
    const { data: managersData } = useQuery(GET_MANAGERS);
    const { data: serviceStatusesData } = useQuery(GET_SERVICE_STATUSES);

    // Підготовка довідкових даних для фільтрів
    const filterOptions = {
        serviceTypes: serviceTypesData?.serviceTypes || [],
        projectStatuses: projectStatusesData?.projectStatuses || [],
        projectTypes: projectTypesData?.projectTypes || [],
        clients: clientsData?.clients || [],
        managers: managersData?.managers || [],
        serviceStatuses: serviceStatusesData?.serviceInProgressStatuses || []
    };

    // Отримання пагінованих даних сервісів
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
        skip: filters.groupByProject, // Пропускаємо запит, якщо використовуємо групування за проектами
        fetchPolicy: "network-only"
    });

    // Визначення стану завантаження та помилок
    const loading = servicesLoading;
    const error = servicesError;

    // Обробка зміни сторінки
    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            page: newPage - 1 // Конвертуємо до 0-базованої індексації
        }));
    };

    // Обробка зміни розміру сторінки
    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({
            ...prev,
            size: newSize,
            page: 0 // Скидаємо до першої сторінки при зміні розміру сторінки
        }));
    };

    // Обробка зміни сортування
    const handleSortChange = (field) => {
        setPagination(prev => {
            // Якщо клікаємо те саме поле, переключаємо напрямок
            const newDirection = prev.sortField === field && prev.sortDirection === "ASC" ? "DESC" : "ASC";

            return {
                ...prev,
                sortField: field,
                sortDirection: newDirection
            };
        });
    };

    // Обробка створення та деталей сервісу
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

    // Обробка оновлення даних
    const handleRefresh = () => {
        refetchServices();
    };

    // Отримання даних для відображення
    const paginatedServices = servicesData?.paginatedProjectServices?.content || [];
    const pageInfo = servicesData?.paginatedProjectServices?.pageInfo;

    // Розрахунок загальної кількості сторінок для пагінації
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

            {/* Відображаємо або плоский список, або групований за проектами */}
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

                    {/* Компонент пагінації */}
                    {!loading && !error && paginatedServices.length > 0 && (
                        <Pagination
                            currentPage={pagination.page + 1} // Конвертуємо до 1-базованої для UI
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

            {/* Модальне вікно створення сервісу з задачами */}
            {showCreateModal && selectedService && (
                <CreateServiceModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleServiceCreated}
                    projectService={selectedService}
                />
            )}

            {/* Модальне вікно деталей сервісу */}
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