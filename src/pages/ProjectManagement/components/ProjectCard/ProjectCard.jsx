import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PROJECT_SERVICES, GET_PROJECT_PAYMENTS } from "../../graphql/projects.gql";

import Button from "../../../../components/common/Button/Button";
import ServiceCard from "../ServiceCard/ServiceCard";
import Card from "../../../../components/common/Card/Card";
import StatusBadge from "../../../../components/common/StatusBadge/StatusBadge";
import PaymentsList from "../PaymentsList/PaymentsList";
import "./ProjectCard.css";

export default function ProjectCard({
                                        project,
                                        onEdit,
                                        onDelete,
                                        setPaymentToDelete,
                                        onAddPayment,
                                        onEditPayment,
                                        onOpenServiceDetails,
                                        onShowImplementationDetails
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

    // Format date in a compact way
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {year: '2-digit', month: '2-digit', day: '2-digit'});
    };

    // Get status for styling the left border
    const getStatusClass = () => {
        const status = project.status?.name?.toLowerCase() || '';
        if (status.includes('completed') || status.includes('done')) return 'project-status-completed';
        if (status.includes('in progress') || status.includes('active')) return 'project-status-in-progress';
        if (status.includes('pending') || status.includes('scheduled')) return 'project-status-pending';
        if (status.includes('cancelled') || status.includes('on-hold')) return 'project-status-cancelled';
        return '';
    };

    return (
        <Card className={`project-card ${open ? "project-expanded" : ""} ${getStatusClass()}`}>
            <div className="project-header" onClick={() => setOpen(prev => !prev)}>
                <div className="project-main-row">
                    <div className="project-title-section">
                        <h2 className="project-name">{project.name}</h2>
                        <StatusBadge status={project.status?.name || "Unknown"} type="project" size="small" />
                    </div>

                    <div className="project-actions">
                        <Button variant="outline" size="small" icon="✏️" onClick={handleEdit} />
                        <Button variant="danger" size="small" icon="🗑️" onClick={handleDelete} />
                        <Button
                            variant={open ? "primary" : "outline"}
                            icon={open ? "▲" : "▼"}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(!open);
                            }}
                        />
                    </div>
                </div>

                <div className="project-info-row">
                    <div className="project-info-column">
                        <div className="project-info-item">
                            <span className="project-info-label">Client:</span>
                            <span className="project-info-value project-client">{project.client?.name || "—"}</span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Type:</span>
                            <span className="project-info-value">{project.projectType?.name || "—"}</span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Manager:</span>
                            <span className="project-info-value">{project.manager ? `${project.manager.name} ${project.manager.surname}` : "—"}</span>
                        </div>
                    </div>

                    <div className="project-info-column">
                        <div className="project-info-item">
                            <span className="project-info-label">Registration:</span>
                            <span className="project-info-value project-date">{formatDate(project.registrationDate)}</span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Period:</span>
                            <span className="project-info-value project-date">
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Payment due:</span>
                            <span className="project-info-value project-date">{formatDate(project.paymentDeadline)}</span>
                        </div>
                    </div>

                    <div className="project-info-column">
                        <div className="project-info-item">
                            <span className="project-info-label">Est. cost:</span>
                            <span className="project-info-value project-cost">
                ${(+project.estimateCost || 0).toFixed(2)}
              </span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Actual cost:</span>
                            <span className="project-info-value project-cost">
                ${(+project.cost || 0).toFixed(2)}
              </span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Diff:</span>
                            <span className={`project-info-value project-cost ${
                                (project.estimateCost || 0) >= (project.cost || 0) ? 'cost-under' : 'cost-over'
                            }`}>
                ${Math.abs((+project.estimateCost || 0) - (+project.cost || 0)).toFixed(2)}
                                {(project.estimateCost || 0) >= (project.cost || 0) ? ' under' : ' over'}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {open && (
                <div className="project-expanded-content">
                    {project.description && (
                        <div className="project-description-section">
                            <h5 className="project-section-title">Description</h5>
                            <p className="project-description">{project.description}</p>
                        </div>
                    )}

                    <h5 className="project-section-title">Services</h5>
                    <div className="project-services-section">
                        {loadingServices && <div className="project-loading-indicator">Loading services...</div>}
                        {!loadingServices && !services.length && (
                            <div className="project-no-items-message">No services added to this project.</div>
                        )}
                        {services.map((ps) => (
                            <ServiceCard
                                key={ps.id}
                                projectService={ps}
                                onOpenDetails={() => onOpenServiceDetails?.(ps)}
                                onShowImplementationDetails={onShowImplementationDetails}
                            />
                        ))}
                    </div>

                    <h5 className="project-section-title">Payments</h5>
                    <div className="project-payments-section">
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
                    </div>
                </div>
            )}
        </Card>
    );
}