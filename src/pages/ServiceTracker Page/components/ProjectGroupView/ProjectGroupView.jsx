import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_PAGINATED_PROJECTS } from "../../graphql/queries";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import Pagination from "../../../../components/common/Pagination/Pagination";
import ServiceCard from "../ServiceCard/ServiceCard";
import "./ProjectGroupView.css";

export default function ProjectGroupView({
                                             filters = {},
                                             onCreateService,
                                             onViewDetails
                                         }) {
    const [expandedProjects, setExpandedProjects] = useState({});

    // Створюємо окремий стан для пагінації проектів
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        sortField: "name",
        sortDirection: "ASC"
    });

    // Перетворюємо фільтри сервісів на фільтри проектів
    const getProjectFilters = () => {
        const projectFilters = {};

        // Використовуємо пошуковий запит для імені проекту
        if (filters.searchQuery) {
            projectFilters.nameContains = filters.searchQuery;
        }

        // Перенесення відповідних фільтрів
        if (filters.projectStatusIds?.length > 0) {
            projectFilters.statusIds = filters.projectStatusIds;
        }

        if (filters.projectTypeIds?.length > 0) {
            projectFilters.projectTypeIds = filters.projectTypeIds;
        }

        if (filters.clientIds?.length > 0) {
            projectFilters.clientIds = filters.clientIds;
        }

        if (filters.managerIds?.length > 0) {
            projectFilters.managerIds = filters.managerIds;
        }

        // Діапазон дат
        if (filters.dateRange) {
            if (filters.dateRange.startDateFrom) {
                projectFilters.startDateFrom = filters.dateRange.startDateFrom;
            }
            if (filters.dateRange.startDateTo) {
                projectFilters.startDateTo = filters.dateRange.startDateTo;
            }
            if (filters.dateRange.endDateFrom) {
                projectFilters.endDateFrom = filters.dateRange.endDateFrom;
            }
            if (filters.dateRange.endDateTo) {
                projectFilters.endDateTo = filters.dateRange.endDateTo;
            }
        }

        // Діапазон вартості
        if (filters.costRange) {
            if (filters.costRange.costMin) {
                projectFilters.costMin = parseFloat(filters.costRange.costMin);
            }
            if (filters.costRange.costMax) {
                projectFilters.costMax = parseFloat(filters.costRange.costMax);
            }
        }

        return projectFilters;
    };

    // Виконуємо запит на отримання проектів
    const { data, loading, error, refetch } = useQuery(GET_PAGINATED_PROJECTS, {
        variables: {
            input: {
                page: pagination.page,
                size: pagination.size,
                sortField: pagination.sortField,
                sortDirection: pagination.sortDirection,
                filter: getProjectFilters()
            }
        },
        fetchPolicy: "network-only"
    });

    // Повторно отримуємо дані при зміні фільтрів або пагінації
    useEffect(() => {
        refetch({
            input: {
                page: pagination.page,
                size: pagination.size,
                sortField: pagination.sortField,
                sortDirection: pagination.sortDirection,
                filter: getProjectFilters()
            }
        });
    }, [filters, pagination.page, pagination.size, pagination.sortField, pagination.sortDirection]);

    const projects = data?.paginatedProjects?.content || [];
    const pageInfo = data?.paginatedProjects?.pageInfo || {
        totalElements: 0,
        totalPages: 1,
        number: 0,
        size: pagination.size
    };

    // Переключення розгорнутого/згорнутого стану проекту
    const toggleProject = id =>
        setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }));

    // Перевірка чи має проект незавершені сервіси
    const hasIncompleteServices = p =>
        p.projectServices.some(ps => ps.servicesInProgress.length < ps.amount);

    // Обробка зміни сторінки
    const handlePageChange = (pageNumber) =>
        setPagination(prev => ({ ...prev, page: pageNumber - 1 }));

    // Обробка зміни розміру сторінки
    const handlePageSizeChange = (newSize) =>
        setPagination(prev => ({ ...prev, page: 0, size: newSize }));

    // Обробка зміни сортування
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

    if (loading) {
        return <Card className="loading-card">Loading projects...</Card>;
    }

    if (error) {
        return <Card className="error-card">Error loading projects: {error.message}</Card>;
    }

    if (projects.length === 0) {
        return (
            <Card className="empty-state-card">
                <div className="no-projects-message">
                    {filters.searchQuery || filters.clientIds?.length > 0
                        ? "Немає проєктів, що відповідають критеріям пошуку."
                        : "У всіх проєктах усі сервіси повністю виконані."}
                </div>
            </Card>
        );
    }

    return (
        <>
            {/* Панель сортування проектів */}
            <div className="sort-controls">
                <span className="sort-label">Sort by:</span>
                <button
                    className={`sort-button ${pagination.sortField === "name" ? "active" : ""}`}
                    onClick={() => handleSortChange("name")}
                >
                    Project Name {pagination.sortField === "name" ? (pagination.sortDirection === "ASC" ? "↑" : "↓") : null}
                </button>
                <button
                    className={`sort-button ${pagination.sortField === "cost" ? "active" : ""}`}
                    onClick={() => handleSortChange("cost")}
                >
                    Cost {pagination.sortField === "cost" ? (pagination.sortDirection === "ASC" ? "↑" : "↓") : null}
                </button>
                <button
                    className={`sort-button ${pagination.sortField === "startDate" ? "active" : ""}`}
                    onClick={() => handleSortChange("startDate")}
                >
                    Start Date {pagination.sortField === "startDate" ? (pagination.sortDirection === "ASC" ? "↑" : "↓") : null}
                </button>
                <button
                    className={`sort-button ${pagination.sortField === "endDate" ? "active" : ""}`}
                    onClick={() => handleSortChange("endDate")}
                >
                    End Date {pagination.sortField === "endDate" ? (pagination.sortDirection === "ASC" ? "↑" : "↓") : null}
                </button>
            </div>

            <div className="projects-list">
                {projects.map(project => {
                    const totalReq = project.projectServices.reduce((s, ps) => s + ps.amount, 0);
                    const totalImpl = project.projectServices.reduce((s, ps) => s + ps.servicesInProgress.length, 0);
                    const progress = totalReq ? Math.round((totalImpl / totalReq) * 100) : 100;
                    const incompleteCnt = totalReq - totalImpl;

                    // Фільтруємо сервіси згідно з пошуковим запитом
                    const filteredServices = project.projectServices.filter(ps => {
                        const matchesName = filters.searchQuery
                            ? ps.service?.serviceName?.toLowerCase().includes(filters.searchQuery.toLowerCase())
                            : true;
                        const mismatched = filters.onlyMismatched
                            ? ps.amount > ps.servicesInProgress.length
                            : true;
                        return matchesName && mismatched;
                    });

                    return (
                        <div key={project.id} className="project-group">
                            <div
                                className={`project-header ${hasIncompleteServices(project) ? "incomplete" : "complete"}`}
                                onClick={() => toggleProject(project.id)}
                            >
                                <div className="project-header-info">
                                    <h3 className="project-name">{project.name}</h3>
                                    <div className="project-meta">
                                        <Badge
                                            variant={project.status?.name?.toLowerCase() === "completed" ? "success" : "primary"}
                                            size="small"
                                        >
                                            {project.status?.name || "Unknown"}
                                        </Badge>
                                        <span className="project-client">{project.client.name}</span>
                                        {project.startDate && (
                                            <span className="project-date">
                                                {new Date(project.startDate).toLocaleDateString()} -
                                                {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Present"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="project-summary">
                                    <div className="project-progress">
                                        <div className="progress-label">
                                            <span>Services: {totalImpl}/{totalReq}</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                    {incompleteCnt > 0 && (
                                        <span className="incomplete-count">
                                            {incompleteCnt} service{incompleteCnt !== 1 ? "s" : ""} pending
                                        </span>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={e => {
                                        e.stopPropagation();
                                        toggleProject(project.id);
                                    }}
                                >
                                    {expandedProjects[project.id] ? "Collapse" : "Expand"}
                                </Button>
                            </div>

                            {expandedProjects[project.id] && (
                                <div className="project-services">
                                    {filteredServices.length > 0 ? (
                                        <div className="services-grid">
                                            {filteredServices.map(ps => (
                                                <ServiceCard
                                                    key={ps.id}
                                                    service={ps}
                                                    onCreateService={onCreateService}
                                                    onViewDetails={onViewDetails}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-services-message">
                                            {filters.onlyMismatched
                                                ? "Усі сервіси цього проекту вже мають достатню кількість імплементацій"
                                                : filters.searchQuery
                                                    ? "Немає сервісів, що відповідають критеріям пошуку."
                                                    : "Для цього проєкту немає сервісів."}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Пагінація */}
            <Pagination
                currentPage={pageInfo.number + 1}
                totalPages={pageInfo.totalPages}
                onPageChange={handlePageChange}
                pageSize={pageInfo.size}
                onPageSizeChange={handlePageSizeChange}
                totalItems={pageInfo.totalElements}
                pageSizeOptions={[5, 10, 20, 50]}
            />
        </>
    );
}