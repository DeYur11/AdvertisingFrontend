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

    // Форматування дати в компактному вигляді
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {year: '2-digit', month: '2-digit', day: '2-digit'});
    };

    // Отримання статусу для стилізації лівої межі
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
                        <StatusBadge className="project-status-cust" status={project.status?.name || "Невідомо"} type="project" size="large" />
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
                            <span className="project-info-label">Клієнт:</span>
                            <span className="project-info-value project-client">{project.client?.name || "—"}</span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Тип:</span>
                            <span className="project-info-value">{project.projectType?.name || "—"}</span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Менеджер:</span>
                            <span className="project-info-value">{project.manager ? `${project.manager.name} ${project.manager.surname}` : "—"}</span>
                        </div>
                    </div>

                    <div className="project-info-column">
                        <div className="project-info-item">
                            <span className="project-info-label">Реєстрація:</span>
                            <span
                                className="project-info-value project-date">{formatDate(project.registrationDate)}</span>
                        </div>

                        <div className="project-info-item">
                            <span className="project-info-label">Дата початку:</span>
                            <span className="project-info-value project-date">{formatDate(project.startDate)}</span>
                        </div>

                        <div className="project-info-item">
                            <span className="project-info-label">Дата закінчення:</span>
                            <span className="project-info-value project-date">{formatDate(project.endDate)}</span>
                        </div>
                    </div>

                    <div className="project-info-column">
                        <div className="project-info-item">
                            <span className="project-info-label">Оцін. вартість:</span>
                            <span className="project-info-value project-cost">
                ${(+project.estimateCost || 0).toFixed(2)}
              </span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Вартість:</span>
                            <span className="project-info-value project-cost">
                ${(+project.cost || 0).toFixed(2)}
              </span>
                        </div>
                        <div className="project-info-item">
                            <span className="project-info-label">Термін оплати:</span>
                            <span
                                className="project-info-value project-date">{formatDate(project.paymentDeadline)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {open && (
                <div className="project-expanded-content">
                    {project.description && (
                        <div className="project-description-section">
                            <h5 className="project-section-title">Опис</h5>
                            <p className="project-description">{project.description}</p>
                        </div>
                    )}

                    <h5 className="project-section-title">Послуги</h5>
                    <div className="project-services-section">
                        {loadingServices && <div className="project-loading-indicator">Завантаження послуг...</div>}
                        {!loadingServices && !services.length && (
                            <div className="project-no-items-message">До цього проекту не додано послуг.</div>
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

                    <h5 className="project-section-title">Платежі</h5>
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