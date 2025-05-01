import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import ServiceSection from './ServiceSection';

const GET_PROJECT_SERVICES = gql`
  query GetProjectServicesByProject($projectId: ID!) {
    projectServicesByProject(projectId: $projectId) {
      id
      amount
      service {
        id
        serviceName
        estimateCost
      }
      servicesInProgress {
        id
        startDate
        endDate
        cost
        status {
          name
        }
        tasks {
          id
        }
      }
    }
  }
`;

export default function ProjectCard({ project }) {
    const [expanded, setExpanded] = useState(false);

    const { data, loading } = useQuery(GET_PROJECT_SERVICES, {
        variables: { projectId: project.id },
        skip: !expanded,
    });

    // Групування ProjectService за service.id
    const groupedServices = {};
    if (data) {
        for (const ps of data.projectServicesByProject) {
            const s = ps.service;
            if (!groupedServices[s.id]) {
                groupedServices[s.id] = {
                    id: s.id,
                    serviceName: s.serviceName,
                    estimateCost: s.estimateCost,
                    projectServices: [],
                };
            }
            groupedServices[s.id].projectServices.push(ps);
        }
    }

    return (
        <div className="project-card">
            <div className="project-header" onClick={() => setExpanded(!expanded)}>
                <div>
                    <div className="project-title">{project.name}</div>
                    <div className="project-meta">
                        <span>🧾 {project.client.name}</span> |{" "}
                        <span>📊 {project.projectType.name}</span> |{" "}
                        <span>🕓 {project.status?.name || "—"}</span>
                    </div>
                </div>
                <div className={`toggle-icon ${expanded ? 'expanded' : ''}`}>
                    {expanded ? "▲" : "▼"}
                </div>
            </div>

            {expanded && (
                <div className="project-body">
                    {loading ? (
                        <p>Завантаження сервісів...</p>
                    ) : (
                        Object.values(groupedServices).map((service) => (
                            <ServiceSection key={service.id} service={service} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
