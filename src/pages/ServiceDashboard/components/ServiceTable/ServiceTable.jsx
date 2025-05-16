// src/pages/ServiceDashboard/components/ServiceTable/ServiceTable.jsx
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import "./ServiceTable.css";

export default function ServiceTable({ services, onEdit, onDelete }) {
    // Форматування вартості у вигляді валюти (гривні)
    const formatCurrency = (amount) => {
        return `${parseFloat(amount).toFixed(2)}₴`;
    };

    // Підрахунок кількості використань послуги у проектах
    const getUsageCount = (service) => {
        return service.projectServices ? service.projectServices.length : 0;
    };

    // Форматування дати
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (e) {
            return "Невірна дата";
        }
    };

    if (!services || services.length === 0) {
        return (
            <div className="no-services-message">
                Не знайдено жодної послуги. Додайте нову послугу для початку роботи.
            </div>
        );
    }

    return (
        <div className="service-table-container">
            <table className="service-table">
                <thead>
                <tr>
                    <th>Назва послуги</th>
                    <th>Тип послуги</th>
                    <th>Вартість</th>
                    <th>Використань</th>
                    <th className="actions-column">Дії</th>
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
                                {service.serviceType?.name || "Невідомо"}
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
                                    Редагувати
                                </Button>
                                <Button
                                    variant="danger"
                                    size="small"
                                    onClick={() => onDelete(service)}
                                >
                                    Видалити
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
