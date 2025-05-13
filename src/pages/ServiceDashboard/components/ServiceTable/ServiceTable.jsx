// src/pages/ServiceDashboard/components/ServiceTable/ServiceTable.jsx
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import "./ServiceTable.css";

export default function ServiceTable({ services, onEdit, onDelete }) {
    // Format cost to display as currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Calculate usage count (how many times the service is used in projects)
    const getUsageCount = (service) => {
        return service.projectServices ? service.projectServices.length : 0;
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (e) {
            return "Invalid date";
        }
    };

    if (!services || services.length === 0) {
        return (
            <div className="no-services-message">
                No services found. Add a new service to get started.
            </div>
        );
    }

    return (
        <div className="service-table-container">
            <table className="service-table">
                <thead>
                <tr>
                    <th>Service Name</th>
                    <th>Service Type</th>
                    <th>Est. Cost</th>
                    <th>Usage</th>
                    <th className="actions-column">Actions</th>
                </tr>
                </thead>
                <tbody>
                {services.map((service) => (
                    <tr key={service.id}>
                        <td>{service.serviceName}</td>
                        <td>
                            <Badge
                                variant="primary"
                                size="small"
                            >
                                {service.serviceType?.name || "Unknown"}
                            </Badge>
                        </td>
                        <td className="cost-column">
                            {service.estimateCost
                                ? formatCurrency(service.estimateCost)
                                : "—"}
                        </td>
                        <td className="usage-column">
                <span className="usage-badge">
                  {getUsageCount(service)}
                </span>
                        </td>
                        <td className="actions-column">
                            <div className="row-actions">
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={() => onEdit(service)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="small"
                                    onClick={() => onDelete(service)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}