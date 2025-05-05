import { highlightMatch } from "../../../../utils/highlightMatch";
import ServiceCard from "../ServiceCard/ServiceCard";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import "./ProjectCard.css";

export default function ProjectCard({ project, expanded, onToggle, services, searchQuery, onSelect }) {
    // Get project status for styling
    const projectStatus = project.status?.name?.toLowerCase() || "";

    // Calculate project stats
    const tasksCount = services.reduce((count, service) =>
        count + (service.tasks?.length || 0), 0);

    const activeTasksCount = services.reduce((count, service) =>
        count + service.tasks.filter(task => {
            const status = task.taskStatus?.name?.toLowerCase() || "";
            return status === "in progress" || status === "pending";
        }).length, 0);

    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    // Create toggle button
    const toggleButton = (
        <Button
            variant="text"
            size="small"
            className="toggle-button"
            icon={expanded ? "▲" : "▼"}
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            aria-label={expanded ? "Collapse project" : "Expand project"}
        >
            {expanded ? "Collapse" : "Expand"}
        </Button>
    );

    return (
        <div className="compact-project-wrapper">
            <Card
                className="compact-project-card"
            >
                <div className="compact-project-header">
                    <div className="project-title">
                        {highlightMatch(project.name, searchQuery)}
                    </div>

                    <div className="project-meta">
                        <div className="meta-item">
                            <span className="meta-label">Type:</span>
                            <span className="meta-value">{project.projectType?.name || "—"}</span>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label">Status:</span>
                            <Badge
                                variant={
                                    projectStatus === "completed" ? "success" :
                                        projectStatus === "in progress" ? "primary" :
                                            "default"
                                }
                                size="small"
                            >
                                {project.status?.name || "Unknown"}
                            </Badge>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label">Client:</span>
                            <span className="meta-value">{project.client?.name || "—"}</span>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label">Manager:</span>
                            <span className="meta-value">
                                {project.manager ? `${project.manager.name} ${project.manager.surname}` : "—"}
                            </span>
                        </div>

                        <div className="meta-item date-item">
                            <span className="meta-label">Start:</span>
                            <span className="meta-value date-value">{formatDate(project.startDate)}</span>
                        </div>

                        <div className="meta-item date-item">
                            <span className="meta-label">End:</span>
                            <span className="meta-value date-value">{formatDate(project.endDate)}</span>
                        </div>
                    </div>

                    <div className="project-stats">
                        <div className="stat-item">
                            <span className="stat-value">{tasksCount}</span>
                            <span className="stat-label">Total</span>
                        </div>
                        <div className="stat-item active">
                            <span className="stat-value">{activeTasksCount}</span>
                            <span className="stat-label">Active</span>
                        </div>
                    </div>

                    <div className="toggle-container">
                        {toggleButton}
                    </div>
                </div>
            </Card>

            {expanded && (
                <div className="services-section">
                    <div className="services-header">
                        <h4 className="services-title">Services</h4>
                    </div>

                    {services.length > 0 ? (
                        <div className="services-grid-dashboard">
                            {services.map(service => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    searchQuery={searchQuery}
                                    onSelect={onSelect}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-services">No services found for this project</div>
                    )}
                </div>
            )}
        </div>
    );
}