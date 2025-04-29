import { highlightMatch } from "../../utils/highlightMatch";
import ServiceCard from "./ServiceCard";

export default function ProjectCard({ project, expanded, onToggle, services, searchQuery, onSelect }) {
    return (
        <div className="project-section">
            <div className="project-header" onClick={onToggle}>
                <div>
                    <div className="project-title">
                        {highlightMatch(project.name, searchQuery)}
                    </div>
                    <div className="project-info">
                        <strong>Тип:</strong> {project.projectType?.name} &nbsp;|&nbsp;
                        <strong>Статус:</strong> {project.status?.name} &nbsp;|&nbsp;
                        <strong>Клієнт:</strong> {project.client?.name} &nbsp;|&nbsp;
                        <strong>Менеджер:</strong> {project.manager ? `${project.manager.name} ${project.manager.surname}` : "—"}
                    </div>
                </div>
                <div className={`toggle-icon ${expanded ? "expanded" : ""}`}>
                    {expanded ? "▲" : "▼"}
                </div>
            </div>

            {expanded && (
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
            )}
        </div>
    );
}
