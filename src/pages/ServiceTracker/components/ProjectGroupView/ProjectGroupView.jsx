import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_PAGINATED_PROJECTS } from "../../graphql/queries"; // ваш GQL-запит
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

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        sortField: "name",
        sortDirection: "ASC"
    });

    const { data, loading, error, refetch } = useQuery(GET_PAGINATED_PROJECTS, {
        variables: {
            input: {
                page: pagination.page,
                size: pagination.size,
                sortField: pagination.sortField,
                sortDirection: pagination.sortDirection,
                filter: filters
            }
        },
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        refetch({
            input: {
                ...pagination,
                filter: filters
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

    const toggleProject = id =>
        setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }));

    const hasIncompleteServices = p =>
        p.projectServices.some(ps => ps.servicesInProgress.length < ps.amount);

    const handlePageChange = (pageNumber) =>
        setPagination(prev => ({ ...prev, page: pageNumber - 1 }));

    const handlePageSizeChange = (newSize) =>
        setPagination({ page: 0, size: newSize });

    if (loading) {
        return <Card className="loading-card">Loading...</Card>;
    }

    if (error) {
        return <Card className="error-card">Error loading projects</Card>;
    }

    if (projects.length === 0) {
        return (
            <Card className="empty-state-card">
                <div className="no-projects-message">
                    {filters?.nameContains || filters?.clientIds?.length > 0
                        ? "Немає проєктів, що відповідають критеріям пошуку."
                        : "У всіх проєктах усі сервіси повністю виконані."}
                </div>
            </Card>
        );
    }

    return (
        <>
            <div className="projects-list">
                {projects.map(project => {
                    const totalReq = project.projectServices.reduce((s, ps) => s + ps.amount, 0);
                    const totalImpl = project.projectServices.reduce((s, ps) => s + ps.servicesInProgress.length, 0);
                    const progress = totalReq ? Math.round((totalImpl / totalReq) * 100) : 100;
                    const incompleteCnt = totalReq - totalImpl;

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
                                    </div>
                                </div>

                                <div className="project-summary">
                                    <div className="project-progress">
                                        <span className="progress-label">Services: {totalImpl}/{totalReq}</span>
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
                                    icon={expandedProjects[project.id] ? "▼" : "►"}
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
                                                ? "Усі сервіси цього проєкту вже виконані."
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
