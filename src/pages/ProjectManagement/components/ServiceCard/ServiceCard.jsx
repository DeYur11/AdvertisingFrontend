import { useState } from "react";
import { highlightMatch } from "../../../../utils/highlightMatch";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import ServiceInProgressItem from "../ServiceInProgressItem/ServiceInProgressItem";
import "./ServiceCard.css";

export default function ServiceCard({
                                        service,
                                        searchQuery,
                                        onEdit,
                                        onDelete
                                    }) {
    const [expanded, setExpanded] = useState(false);

    // Count active services in progress
    const activeCount = service.servicesInProgress.filter(sip => {
        const status = sip.status?.name?.toLowerCase() || "";
        return status === "in progress" || status === "pending";
    }).length;

    // Total services in progress
    const totalCount = service.servicesInProgress.length;

    // Format cost
    const formatCost = (cost) => {
        if (!cost) return "—";
        return `$${parseFloat(cost).toFixed(2)}`;
    };

    return (
        <Card className="service-card">
            <div className="service-header">
                <div className="service-info">
                    <div className="service-title">
                        {highlightMatch(service.serviceName, searchQuery)}
                    </div>
                    <div className="service-type">
                        {service.serviceType?.name && (
                            <Badge size="small" className="service-type-badge">
                                {service.serviceType.name}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="service-meta">
                    <div className="meta-item">
                        <span className="meta-label">Est. Cost:</span>
                        <span className="meta-value cost">{formatCost(service.estimateCost)}</span>
                    </div>

                    <div className="meta-item">
                        <span className="meta-label">Duration:</span>
                        <span className="meta-value">{service.duration ? `${service.duration} days` : "—"}</span>
                    </div>
                </div>

                <div className="service-counter">
                    <span className="count">{totalCount}</span>
                    <span className="label">{totalCount === 1 ? 'order' : 'orders'}</span>
                    {activeCount > 0 && (
                        <Badge className="active-badge" size="small">
                            {activeCount} active
                        </Badge>
                    )}
                </div>
            </div>

            {service.description && (
                <div className="service-description">
                    {service.description.length > 150
                        ? `${service.description.substring(0, 150)}...`
                        : service.description}
                </div>
            )}

            <div className="service-actions">
                <Button
                    variant="outline"
                    size="small"
                    icon="✏️"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(service);
                    }}
                >
                    Edit
                </Button>

                <Button
                    variant="danger"
                    size="small"
                    icon="🗑"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(service);
                    }}
                >
                    Delete
                </Button>

                <Button
                    variant={expanded ? "primary" : "outline"}
                    size="small"
                    icon={expanded ? "🔽" : "🔼"}
                    className="expand-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                >
                    {expanded ? "Hide Orders" : "Show Orders"}
                </Button>
            </div>

            {expanded && (
                <div className="services-in-progress">
                    <div className="sip-header">
                        <h5 className="sip-title">Service Orders</h5>
                        <Button
                            variant="primary"
                            size="small"
                            icon="➕"
                            className="add-sip-button"
                        >
                            Add Order
                        </Button>
                    </div>

                    {service.servicesInProgress.length > 0 ? (
                        <div className="sip-list">
                            {service.servicesInProgress.map(sip => (
                                <ServiceInProgressItem
                                    key={sip.id}
                                    serviceInProgress={sip}
                                    searchQuery={searchQuery}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-sip-message">
                            No service orders found. Click "Add Order" to create a new service order.
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}