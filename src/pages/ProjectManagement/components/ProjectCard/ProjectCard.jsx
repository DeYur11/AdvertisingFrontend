import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PROJECT_SERVICES, GET_PROJECT_PAYMENTS } from "../../graphql/projects.gql";

import Button from "../../../../components/common/Button/Button";
import ServiceCard from "../ServiceCard/ServiceCard";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import PaymentsList from "../PaymentsList/PaymentsList";

export default function ProjectCard({
                                        project,
                                        onEdit,
                                        onDelete,
                                        setPaymentToDelete,
                                        onAddPayment,
                                        onEditPayment
                                    }) {
    const [open, setOpen] = useState(false);

    const {
        data: servicesData,
        loading: loadingServices
    } = useQuery(GET_PROJECT_SERVICES, {
        variables: { projectId: project.id },
        fetchPolicy: "cache-first"
    });

    const {
        data: paymentsData,
        loading: loadingPayments,
        error: errorPayments,
        refetch: refetchPayments
    } = useQuery(GET_PROJECT_PAYMENTS, {
        variables: { projectId: project.id },
        fetchPolicy: "network-only"
    });

    const services = servicesData?.projectServicesByProject ?? [];
    const payments = paymentsData?.paymentsByProject ?? [];

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit?.(project.id);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete?.(project.id);
    };

    const handleDeletePayment = (payment) => {
        setPaymentToDelete?.(payment);
        refetchPayments()
    };

    return (
        <Card className={`project-card ${open ? "expanded" : ""}`}>
            <div className="project-header" onClick={() => setOpen(prev => !prev)} style={{ cursor: "pointer" }}>
                <div className="project-title">
                    <h2>{project.name}</h2>
                    {project.status && (
                        <Badge
                            variant={
                                project.status.name.toLowerCase() === "completed"
                                    ? "success"
                                    : project.status.name.toLowerCase() === "in progress"
                                        ? "primary"
                                        : "default"
                            }
                        >
                            {project.status.name}
                        </Badge>
                    )}
                </div>

                <div className="project-meta">
                    <span>{project.client?.name}</span> ·
                    <span>{project.projectType?.name}</span> ·
                    <span>
                        {project.manager
                            ? `${project.manager.name} ${project.manager.surname}`
                            : "—"}
                    </span>
                </div>

                <div className="project-stats">
                    <span>${(+project.estimateCost).toFixed(2)} est.</span>
                    <span>${(+project.cost).toFixed(2)} act.</span>
                </div>
            </div>

            <div className="project-actions" style={{ marginTop: 8 }}>
                <Button variant="outline" size="small" icon="✏️" onClick={handleEdit}>Edit</Button>
                <Button variant="danger" size="small" icon="🗑️" onClick={handleDelete}>Delete</Button>
                <Button
                    variant={open ? "primary" : "outline"}
                    icon={open ? "▲" : "▼"}
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(!open);
                    }}
                >
                    {open ? "Collapse" : "Expand"}
                </Button>
            </div>

            {open && (
                <>
                    {project.description && (
                        <p className="project-description">{project.description}</p>
                    )}

                    <h4 className="mt-2">Services</h4>
                    {loadingServices && <div className="loading-indicator">Loading services...</div>}
                    {!loadingServices && !services.length && (
                        <div className="no-items-message">No services.</div>
                    )}
                    {services.map((ps) => (
                        <ServiceCard key={ps.id} projectService={ps} />
                    ))}

                    <h4 className="mt-3">Payments</h4>
                    <PaymentsList
                        project={project}
                        payments={payments}
                        loading={loadingPayments}
                        error={errorPayments}
                        onAddPayment={() => {
                            onAddPayment?.(refetchPayments)
                            refetchPayments()
                        }}
                        onEditPayment={(payment) => onEditPayment?.(payment, refetchPayments)}
                        onDeletePayment={handleDeletePayment}
                    />
                </>
            )}
        </Card>
    );
}
