import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
    GET_PROJECT_SERVICES,
    GET_PROJECT_PAYMENTS,
} from "../../graphql/projects.gql";

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
                                        onShowImplementationDetails,
                                        onPauseProject,
                                        onResumeProject,
                                        onCancelProject
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

    // Helper function to check if the project is cancelled
    const isProjectCancelled = () => {
        const status = project.status?.name?.toLowerCase() || '';
        return status.includes('cancelled') || status.includes('cancel');
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        // Prevent editing if project is cancelled
        if (isProjectCancelled()) {
            // Show toast notification or alert
            alert("Неможливо редагувати скасований проект");
            return;
        }
        onEdit?.(project.id);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete?.(project.id);
    };

    const handleDeletePayment = (payment) => {
        // Prevent payment deletion if project is cancelled
        if (isProjectCancelled()) {
            alert("Неможливо видалити платіж для скасованого проекту");
            return;
        }
        setPaymentToDelete?.(payment);
        refetchPayments();
    };

    // Helper function to check if the project can be paused
    const canBePaused = () => {
        const status = project.status?.name?.toLowerCase() || '';
        return status.includes('progress') || status.includes('active') || status.includes('not started');
    };

    // Helper function to check if the project can be resumed
    const canBeResumed = () => {
        const status = project.status?.name?.toLowerCase() || '';
        return status.includes('paused') || status.includes('on hold');
    };

    // Helper function to check if the project can be canceled
    const canBeCanceled = () => {
        const status = project.status?.name?.toLowerCase() || '';
        // Only allow cancellation for paused/on-hold projects
        return status.includes('paused') || status.includes('on hold');
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
        if (status.includes('In Progress') || status.includes('active')) return 'project-status-in-progress';
        if (status.includes('pending') || status.includes('scheduled')) return 'project-status-pending';
        if (status.includes('paused') || status.includes('on-hold')) return 'project-status-paused';
        if (status.includes('cancelled')) return 'project-status-cancelled';
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
                        {canBePaused() && (
                            <Button
                                variant="warning"
                                size="small"
                                icon="⏸️"
                                title="Призупинити проект"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPauseProject?.(project);
                                }}
                            />
                        )}

                        {canBeResumed() && (
                            <Button
                                variant="success"
                                size="small"
                                icon="▶️"
                                title="Відновити проект"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onResumeProject?.(project);
                                }}
                            />
                        )}

                        {canBeCanceled() && (
                            <Button
                                variant="danger"
                                size="small"
                                icon="❌"
                                title="Скасувати проект"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCancelProject?.(project);
                                }}
                            />
                        )}

                        <Button
                            variant="outline"
                            size="small"
                            icon="✏️"
                            onClick={handleEdit}
                            disabled={isProjectCancelled()}
                            title={isProjectCancelled() ? "Редагування скасованого проекту заборонено" : "Редагувати проект"}
                            className={isProjectCancelled() ? "button-tooltip" : ""}
                            data-tooltip="Редагування скасованого проекту заборонено"
                        />
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
                    {isProjectCancelled() && (
                        <div className="project-cancelled-warning">
                            <strong>⚠️ Цей проект скасовано.</strong> Редагування та зміна даних заборонені.
                        </div>
                    )}

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
                                isProjectCancelled={isProjectCancelled()}
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
                            onAddPayment={isProjectCancelled() ? null : () => {
                                onAddPayment?.(project, refetchPayments);
                                refetchPayments();
                            }}
                            onEditPayment={isProjectCancelled() ? null : (payment, project) => onEditPayment?.(payment, refetchPayments, project)}
                            onDeletePayment={handleDeletePayment}
                            isProjectCancelled={isProjectCancelled()}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
}