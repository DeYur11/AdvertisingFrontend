import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_SERVICES_IN_PROGRESS_BY_PS } from "../../graphql/projects.gql";

import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import StatusBadge from "../../../../components/common/StatusBadge/StatusBadge";
import ServiceInProgressItem from "../ServiceInProgressItem/ServiceInProgressItem";

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

    // Calculate completion percentage
    const totalOrders = projectService.servicesInProgress?.length || 0;
    const completedOrders = projectService.servicesInProgress?.filter(
        sip => sip.status?.name?.toLowerCase() === "completed"
    ).length || 0;
    const completionPercent = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;

    const handleViewDetails = (e) => {
        e.stopPropagation();
        onOpenDetails?.();
    };

    // Get status for the left border
    const getStatusClass = () => {
        // Check if we have any service implementations to determine status
        if (projectService.servicesInProgress && projectService.servicesInProgress.length > 0) {
            // Count statuses
            const totalOrders = projectService.servicesInProgress.length;
            const completedCount = projectService.servicesInProgress.filter(
                sip => sip.status?.name?.toLowerCase() === "completed"
            ).length;
            const pendingCount = projectService.servicesInProgress.filter(
                sip => sip.status?.name?.toLowerCase() === "pending"
            ).length;

            // Determine overall status based on implementation statuses
            if (completedCount === totalOrders) {
                return 'status-completed';
            } else if (completedCount > 0) {
                return 'status-in-progress';
            } else if (pendingCount === totalOrders) {
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
                        status={svc.serviceType?.name || "Service"}
                        type="service"
                        size="small"
                    />
                </div>

                <div className="service-info">
                    <div className="service-quantity">
                        <span className="quantity-label">Quantity</span>
                        <span className="quantity-value">{qty}×</span>
                    </div>
                    <div className="service-estimate">
                        <span className="estimate-label">Estimate</span>
                        <span className="estimate-value">${est}</span>
                    </div>
                </div>

                <div className="service-completion">
                    <div className="completion-info">
                        <span className="completion-text">{completionPercent}% Complete</span>
                        <span className="completion-details">{completedOrders}/{totalOrders} orders</span>
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
                        Details
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
                    {loading && <div className="loading-indicator">Loading orders...</div>}
                    {!loading && !sips.length && <div className="no-items-message">No orders.</div>}
                    <div className="orders-list">
                        {sips.map(sip => (
                            <ServiceInProgressItem
                                key={sip.id}
                                serviceInProgress={sip}
                                onShowDetails={onShowImplementationDetails}
                            />
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}