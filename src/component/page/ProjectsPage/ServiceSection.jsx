import { useState } from 'react';
import ProjectServiceCard from './ProjectServiceCard';

export default function ServiceSection({ service }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="service-section">
            <div className="service-header" onClick={() => setExpanded(!expanded)}>
                <h4>{service.serviceName}</h4>
                <div className={`toggle-icon ${expanded ? 'expanded' : ''}`}>
                    {expanded ? '▲' : '▼'}
                </div>
            </div>

            {expanded && (
                <div className="project-service-list">
                    {service.projectServices.map((ps) => (
                        <ProjectServiceCard key={ps.id} projectService={ps} />
                    ))}
                </div>
            )}
        </div>
    );
}
