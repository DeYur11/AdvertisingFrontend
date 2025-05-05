import { useState } from "react";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import ServiceCard from "../ServiceCard/ServiceCard";
import "./ProjectGroupView.css";

export default function ProjectGroupView({
                                             projects,
                                             onCreateService,
                                             onViewDetails,
                                             filters
                                         }) {
    const [expandedProjects, setExpandedProjects] = useState({});

    const toggleProject = (projectId) => {
        setExpandedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    };

    const hasIncompleteServices = (project) =>
        project.projectServices.some(ps => ps.servicesInProgress.length < ps.amount);

    const hasMatchingServices = (project) =>
        project.projectServices.some(ps => {
            const matchesServiceQuery = filters.searchQuery
                ? ps.service?.serviceName?.toLowerCase().includes(filters.searchQuery.toLowerCase())
                : true;

            const isMismatched = filters.onlyMismatched
                ? ps.servicesInProgress.length < ps.amount
                : true;

            return matchesServiceQuery && isMismatched;
        });

    const filteredProjects = projects.filter(project => {
        const matchesSearch = filters.searchQuery
            ? (
                project.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                project.client.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                hasMatchingServices(project)
            )
            : true;

        const includeProject = !filters.searchQuery && filters.onlyMismatched
            ? hasIncompleteServices(project)
            : true;

        return matchesSearch && includeProject;
    });

    if (filteredProjects.length === 0) {
        return (
            <Card className="empty-state-card">
                <div className="no-projects-message">
                    {filters.searchQuery
                        ? "No projects match your search criteria."
                        : "All services in all projects have been fully implemented."}
                </div>
            </Card>
        );
    }

    return (
        <div className="projects-list">
            {filteredProjects.map(project => {
                const filteredServices = project.projectServices.filter(ps => {
                    const matchesServiceName = filters.searchQuery
                        ? ps.service?.serviceName?.toLowerCase().includes(filters.searchQuery.toLowerCase())
                        : true;

                    const isMismatched = filters.onlyMismatched
                        ? ps.amount > ps.servicesInProgress.length
                        : true;

                    return matchesServiceName && isMismatched;
                });

                const incompleteCount = project.projectServices.reduce(
                    (count, ps) => count + Math.max(0, ps.amount - ps.servicesInProgress.length),
                    0
                );

                const totalRequired = project.projectServices.reduce(
                    (sum, ps) => sum + ps.amount,
                    0
                );

                const totalImplemented = project.projectServices.reduce(
                    (sum, ps) => sum + ps.servicesInProgress.length,
                    0
                );

                const projectProgress = totalRequired > 0
                    ? Math.round((totalImplemented / totalRequired) * 100)
                    : 100;

                return (
                    <div key={project.id} className="project-group">
                        <div
                            className={`project-header ${hasIncompleteServices(project) ? 'incomplete' : 'complete'}`}
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
                                    <span className="progress-label">Services: {totalImplemented}/{totalRequired}</span>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${projectProgress}%` }}
                                        />
                                    </div>
                                </div>
                                {incompleteCount > 0 && (
                                    <span className="incomplete-count">
                                        {incompleteCount} service{incompleteCount !== 1 ? 's' : ''} pending
                                    </span>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="small"
                                icon={expandedProjects[project.id] ? "▼" : "►"}
                                onClick={(e) => {
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
                                            ? "All services for this project have been fully implemented."
                                            : filters.searchQuery
                                                ? "No services match your search criteria."
                                                : "No services found for this project."}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
