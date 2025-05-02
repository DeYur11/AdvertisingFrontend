// CompactProjectCard.jsx
import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { highlightMatch } from "../../../../utils/highlightMatch";
import ServiceCard from "../ServiceCard/ServiceCard";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import { GET_PROJECT_SERVICES } from "../../graphql/projects.gql";
import "./CompactProjectCard.css";

export default function CompactProjectCard({
                                               project,
                                               expanded,
                                               onToggle,
                                               searchQuery,
                                               onEditClient,
                                               onEditProject,
                                               onDeleteProject,
                                               onViewPayments
                                           }) {
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
    const status = project.status?.name?.toLowerCase() || "";

    const [loaded, setLoaded] = useState(false);
    const [fetchServices, { data, loading }] = useLazyQuery(GET_PROJECT_SERVICES, {
        variables: { projectId: project.id },
        fetchPolicy: "cache-first"
    });

    useEffect(() => {
        if (expanded && !loaded) {
            fetchServices();
            setLoaded(true);
        }
    }, [expanded, loaded, fetchServices]);

    const services = data?.projectServicesByProject ?? [];
    const activeCnt = services.reduce((cnt, ps) => {
        return (
            cnt +
            (ps.servicesInProgress ?? []).filter((sip) => {
                const st = sip.status?.name?.toLowerCase() || "";
                return st === "in progress" || st === "pending";
            }).length
        );
    }, 0);

    return (
        <div className="project-row mb-3" onClick={onToggle}>
            <div className="project-header">
        <span>
          <strong>Проєкт:</strong> {highlightMatch(project.name, searchQuery)}
        </span>
                <span>
          <strong>Клієнт:</strong>{" "}
                    <span
                        className="link-primary text-decoration-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditClient(project.client);
                        }}
                    >
            {highlightMatch(project.client?.name || "—", searchQuery)}
          </span>
        </span>
                <span>
          <strong>Статус:</strong>{" "}
                    <Badge
                        variant={
                            status === "completed"
                                ? "success"
                                : status === "in progress"
                                    ? "primary"
                                    : status === "pending"
                                        ? "warning"
                                        : "default"
                        }
                        size="small"
                    >
            {project.status?.name || "Unknown"}
          </Badge>
        </span>
            </div>

            {expanded && (
                <div className="project-details">
                    <div className="mb-2">
                        📅 <strong>Старт:</strong> {fmtDate(project.startDate)} &nbsp;|&nbsp;
                        <strong>Кінець:</strong> {fmtDate(project.endDate)} &nbsp;|&nbsp;
                        <strong>Послуг:</strong> {services.length} &nbsp;|&nbsp;
                        <strong>Активних:</strong> {activeCnt}
                    </div>

                    {loading && <div className="spinner-border spinner-border-sm" />}

                    {services.map((ps) => (
                        <ServiceCard key={ps.id} projectService={ps} searchQuery={searchQuery} />
                    ))}

                    {!loading && services.length === 0 && (
                        <div className="alert alert-light">Жодної послуги не найдено</div>
                    )}

                    <div className="d-flex gap-2 justify-content-end mt-3 flex-wrap">
                        <Button variant="outline" size="sm" icon="💰" onClick={(e) => {
                            e.stopPropagation(); onViewPayments(project);
                        }}>Payments</Button>
                        <Button variant="outline" size="sm" icon="✏️" onClick={(e) => {
                            e.stopPropagation(); onEditProject(project);
                        }}>Edit</Button>
                        <Button variant="danger" size="sm" icon="🔚" onClick={(e) => {
                            e.stopPropagation(); onDeleteProject(project);
                        }}>Delete</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
