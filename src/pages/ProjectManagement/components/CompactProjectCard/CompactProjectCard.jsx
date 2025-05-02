import { highlightMatch } from "../../../../utils/highlightMatch";
import ServiceCard from "../ServiceCard/ServiceCard";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import "./CompactProjectCard.css";

export default function CompactProjectCard({
                                               project,
                                               expanded,
                                               onToggle,
                                               searchQuery,
                                               onAddService,
                                               onEditProject,
                                               onDeleteProject,
                                               onEditService,
                                               onDeleteService,
                                               onEditClient
                                           }) {
    // Get project status for styling
    const projectStatus = project.status?.name?.toLowerCase() || "";

    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    // Calculate financial metrics
    const calculateTotalCost = () => {
        let total = 0;
        project.services.forEach(service => {
            service.servicesInProgress.forEach(sip => {
                if (sip.cost) {
                    total += parseFloat(sip.cost);
                }
            });
        });
        return total.toFixed(2);
    };

    const estimatedBudget = parseFloat(project.budget || 0).toFixed(2);
    const actualCost = calculateTotalCost();
    const budgetRemaining = (parseFloat(estimatedBudget) - parseFloat(actualCost)).toFixed(2);
    const budgetUtilization = estimatedBudget > 0
        ? ((parseFloat(actualCost) / parseFloat(estimatedBudget)) * 100).toFixed(0)
        : 0;

    // Count active services
    const countActiveServices = () => {
        let count = 0;
        project.services.forEach(service => {
            service.servicesInProgress.forEach(sip => {
                const status = sip.status?.name?.toLowerCase() || "";
                if (status === "in progress" || status === "pending") {
                    count++;
                }
            });
        });
        return count;
    };

    const totalServices = project.services.length;
    const activeServices = countActiveServices();

    return (
        <div className="compact-project-wrapper">
            <Card className={`compact-project-card status-${projectStatus}`}>
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
                                            projectStatus === "pending" ? "warning" :
                                                "default"
                                }
                                size="small"
                            >
                                {project.status?.name || "Unknown"}
                            </Badge>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label">Client:</span>
                            <span
                                className="meta-value client-value"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditClient(project.client);
                                }}
                            >
                {highlightMatch(project.client?.name || "—", searchQuery)}
              </span>
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

                    <div className="project-metrics">
                        <div className="metric-item">
                            <span className="metric-value">${estimatedBudget}</span>
                            <span className="metric-label">Budget</span>
                        </div>

                        <div className="metric-item">
                            <span className="metric-value">${actualCost}</span>
                            <span className="metric-label">Actual</span>
                        </div>

                        <div className={`metric-item ${parseFloat(budgetRemaining) < 0 ? 'over-budget' : ''}`}>
                            <span className="metric-value">${budgetRemaining}</span>
                            <span className="metric-label">Remaining</span>
                        </div>

                        <div className={`metric-item ${parseInt(budgetUtilization) > 90 ? 'warning' : ''}`}>
                            <span className="metric-value">{budgetUtilization}%</span>
                            <span className="metric-label">Utilization</span>
                        </div>
                    </div>

                    <div className="project-stats">
                        <div className="stat-item">
                            <span className="stat-value">{totalServices}</span>
                            <span className="stat-label">Services</span>
                        </div>
                        <div className="stat-item active">
                            <span className="stat-value">{activeServices}</span>
                            <span className="stat-label">Active</span>
                        </div>
                    </div>

                    <div className="project-actions">
                        <Button
                            variant="outline"
                            size="small"
                            icon="✏️"
                            className="action-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditProject(project);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            size="small"
                            icon="🗑"
                            className="action-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProject(project);
                            }}
                        >
                            Delete
                        </Button>
                        <Button
                            variant={expanded ? "primary" : "outline"}
                            size="small"
                            icon={expanded ? "🔽" : "🔼"}
                            className="toggle-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            aria-label={expanded ? "Collapse project" : "Expand project"}
                        >
                            {expanded ? "Collapse" : "Expand"}
                        </Button>
                    </div>
                </div>
            </Card>

            {expanded && (
                <div className="services-section">
                    <div className="services-header">
                        <h4 className="services-title">Services</h4>
                        <Button
                            variant="primary"
                            size="small"
                            icon="➕"
                            onClick={() => onAddService(project.id)}
                        >
                            Add Service
                        </Button>
                    </div>

                    {project.services.length > 0 ? (
                        <div className="services-grid">
                            {project.services.map(service => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    searchQuery={searchQuery}
                                    onEdit={() => onEditService(service, project.id)}
                                    onDelete={() => onDeleteService(service)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-services-message">
                            No services found for this project. Click "Add Service" to create a new service.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}