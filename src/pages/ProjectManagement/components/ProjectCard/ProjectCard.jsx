import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PROJECT_SERVICES, GET_PROJECT_PAYMENTS } from "../../graphql/projects.gql";

import Button from "../../../../components/common/Button/Button";
import ServiceCard from "../ServiceCard/ServiceCard";
import Card from "../../../../components/common/Card/Card";
import StatusBadge from "../../../../components/common/StatusBadge/StatusBadge";
import PaymentsList from "../PaymentsList/PaymentsList";

export default function ProjectCard({
                                        project,
                                        onEdit,
                                        onDelete,
                                        setPaymentToDelete,
                                        onAddPayment,
                                        onEditPayment,
                                        onOpenServiceDetails
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
        refetchPayments();
    };

    // Get status for styling the left border
    const getStatusClass = () => {
        const status = project.status?.name?.toLowerCase() || '';

        if (status.includes('completed') || status.includes('done') || status.includes('finished')) {
            return 'status-completed';
        } else if (status.includes('in progress') || status.includes('active') || status.includes('ongoing')) {
            return 'status-in-progress';
        } else if (status.includes('pending') || status.includes('scheduled') || status.includes('planned')) {
            return 'status-pending';
        } else if (status.includes('cancelled') || status.includes('on-hold') || status.includes('blocked')) {
            return 'status-cancelled';
        }
        return '';
    };

    return (
        <Card className={`project-card ${open ? "expanded" : ""} ${getStatusClass()}`}>
            <div className="project-header" onClick={() => setOpen(prev => !prev)} style={{ cursor: "pointer" }}>
                <div className="project-title">
                    <h2>{project.name}</h2>
                    {project.status && (
                        <StatusBadge
                            status={project.status.name}
                            type="project"
                            size={open ? "medium" : "small"}
                        />
                    )}
                </div>

                <div className="project-meta">
                    <div className="meta-item">
                        <span className="meta-label">Client</span>
                        <span className="meta-value">{project.client?.name || "—"}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Type</span>
                        <span className="meta-value">{project.projectType?.name || "—"}</span>
                    </div>
                    {project.manager && (
                        <div className="meta-item">
                            <span className="meta-label">Manager</span>
                            <span className="meta-value">
                                {project.manager.name} {project.manager.surname}
                            </span>
                        </div>
                    )}
                </div>

                <div className="project-stats">
                    <div className="stat-item">
                        <span className="stat-label">Estimated</span>
                        <span className="stat-value">${(+project.estimateCost).toFixed(2)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Actual</span>
                        <span className="stat-value">${(+project.cost).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="project-actions">
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

                    <h4 className="section-title">Services</h4>
                    {loadingServices && <div className="loading-indicator">Loading services...</div>}
                    {!loadingServices && !services.length && (
                        <div className="no-items-message">No services.</div>
                    )}
                    {services.map((ps) => (
                        <ServiceCard
                            key={ps.id}
                            projectService={ps}
                            onOpenDetails={() => onOpenServiceDetails?.(ps)}
                        />
                    ))}

                    <h4 className="section-title">Payments</h4>
                    <PaymentsList
                        project={project}
                        payments={payments}
                        loading={loadingPayments}
                        error={errorPayments}
                        onAddPayment={() => {
                            onAddPayment?.(refetchPayments);
                            refetchPayments();
                        }}
                        onEditPayment={(payment) => onEditPayment?.(payment, refetchPayments)}
                        onDeletePayment={handleDeletePayment}
                    />
                </>
            )}
        </Card>
    );
}