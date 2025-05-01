import { useState } from "react";
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

    // Create action buttons for card
    const cardActions = (
        <>
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
        </>
    );

    return (
        <Card
            className="project-card"
            variant="primary"
            title={highlightMatch(project.name, searchQuery)}
            actions={cardActions}
        >
            <div className="project-info">
                <div className="project-info-grid">
                    <div className="info-item">
                        <div className="info-label">Type</div>
                        <div className="info-value">{project.projectType?.name || "—"}</div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">Status</div>
                        <div className="info-value">
                            <Badge
                                variant={
                                    projectStatus === "completed" ? "success" :
                                        projectStatus === "in progress" ? "primary" :
                                            "default"
                                }
                            >
                                {project.status?.name || "Unknown"}
                            </Badge>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">Client</div>
                        <div className="info-value">{project.client?.name || "—"}</div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">Manager</div>
                        <div className="info-value">
                            {project.manager ? `${project.manager.name} ${project.manager.surname}` : "—"}
                        </div>
                    </div>
                </div>

                <div className="project-stats">
                    <div className="stat-item">
                        <span className="stat-value">{tasksCount}</span>
                        <span className="stat-label">Total Tasks</span>
                    </div>
                    <div className="stat-item active">
                        <span className="stat-value">{activeTasksCount}</span>
                        <span className="stat-label">Active Tasks</span>
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="services-section">
                    <h4 className="services-title">Services</h4>

                    {services.length > 0 ? (
                        <div className="services-grid">
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
        </Card>
    );
}