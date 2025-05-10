import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_SERVICES_IN_PROGRESS_BY_PS } from "../../graphql/projects.gql";

import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import StatusBadge from "../../../../components/common/StatusBadge/StatusBadge";
import ServiceInProgressItem from "../ServiceInProgressItem/ServiceInProgressItem";
import "./ServiceCard.css";

export default function ServiceCard({ projectService, onOpenDetails, onShowImplementationDetails }) {
    const [open, setOpen] = useState(false);
    const [fetchSIP, { data, loading }] = useLazyQuery(
        GET_SERVICES_IN_PROGRESS_BY_PS,
        { variables: { projectServiceId: projectService.id }, fetchPolicy: "cache-first" }
    );

    useEffect(() => { if (open) fetchSIP(); }, [open, fetchSIP]);

    const svc = projectService.service;
    const qty = projectService.amount ?? 1;
    const est = (svc.estimateCost * qty).toFixed(2);
    const sips = data?.servicesInProgressByProjectService ?? [];

    // Розрахунок відсотка виконання
    const totalOrders = projectService.servicesInProgress?.length || 0;
    const completedOrders = projectService.servicesInProgress?.filter(
        sip => sip.status?.name?.toLowerCase() === "completed"
    ).length || 0;
    const inProgressOrders = projectService.servicesInProgress?.filter(
        sip => sip.status?.name?.toLowerCase() === "in progress"
    ).length || 0;
    const pendingOrders = totalOrders - completedOrders - inProgressOrders;
    const completionPercent = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;

    const handleViewDetails = (e) => {
        e.stopPropagation();
        onOpenDetails?.();
    };

    // Отримання класу статусу для лівої рамки картки
    const getStatusClass = () => {
        if (projectService.servicesInProgress && projectService.servicesInProgress.length > 0) {
            if (completedOrders === totalOrders) {
                return 'status-completed';
            } else if (completedOrders > 0) {
                return 'status-in-progress';
            } else if (pendingOrders === totalOrders) {
                return 'status-pending';
            } else {
                return 'status-in-progress';
            }
        }
        return '';
    };

    return (
        <Card className={`service-card ${open ? "expanded" : ""} ${getStatusClass()}`}
              onClick={e => { e.stopPropagation(); setOpen(!open); }}>
            <div className="service-header">
                <div className="service-title">
                    <h5>{svc.serviceName}</h5>
                    <StatusBadge
                        status={svc.serviceType?.name || "Сервіс"}
                        type="service"
                        size="small"
                    />
                </div>

                <div className="service-info">
                    <div className="service-quantity">
                        <span className="quantity-label">Кількість</span>
                        <span className="quantity-value">{qty}×</span>
                    </div>
                    <div className="service-estimate">
                        <span className="estimate-label">Вартість</span>
                        <span className="estimate-value">₴{est}</span>
                    </div>
                </div>

                <div className="service-completion">
                    <div className="completion-info">
                        <span className="completion-text">{completionPercent}% Виконано</span>
                        <span className="completion-details">{completedOrders}/{totalOrders} замовлень</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${completionPercent}%` }}
                        ></div>
                    </div>
                </div>

                <div className="service-actions">
                    <Button
                        variant="outline"
                        size="small"
                        onClick={handleViewDetails}
                    >
                        Деталі
                    </Button>
                    <Button
                        variant={open ? "primary" : "outline"}
                        size="small"
                        icon={open ? "▲" : "▼"}
                        onClick={e => { e.stopPropagation(); setOpen(!open); }}
                    />
                </div>
            </div>

            {open && (
                <div className="service-orders">
                    <div className="orders-header">
                        <h4 className="orders-title">Реалізації сервісу</h4>
                        <div className="orders-summary">
                            <div className="summary-item">
                                <span className="summary-indicator completed"></span>
                                <span className="summary-value">{completedOrders}</span>
                                <span className="summary-label">Завершено</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-indicator in-progress"></span>
                                <span className="summary-value">{inProgressOrders}</span>
                                <span className="summary-label">В процесі</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-indicator pending"></span>
                                <span className="summary-value">{pendingOrders}</span>
                                <span className="summary-label">Очікують</span>
                            </div>
                        </div>
                    </div>

                    {loading && <div className="loading-indicator">Завантаження реалізацій...</div>}
                    {!loading && !sips.length && <div className="no-items-message">Немає реалізацій сервісу.</div>}
                    {!loading && sips.length > 0 && (
                        <div className="orders-list">
                            {sips.map(sip => (
                                <ServiceInProgressItem
                                    key={sip.id}
                                    serviceInProgress={sip}
                                    onShowDetails={onShowImplementationDetails}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}