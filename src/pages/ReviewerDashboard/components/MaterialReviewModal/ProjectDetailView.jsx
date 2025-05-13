import DetailView from "../../../../components/common/DetailView/DetailView";
import Badge from "../../../../components/common/Badge/Badge";
import { formatDate } from "../../utils/reviewerUtils";
import "./ClickableLinks.css";

export default function ProjectDetailView({ project, onClose }) {
    if (!project) return null;

    // Функція для форматування валюти
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return "—";
        return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
    };

    const sections = [
        {
            title: "Інформація про проект",
            fields: [
                { label: "Назва проекту", key: "name" },
                { label: "Клієнт", key: "client.name", fallback: "—" },
                { label: "Опис", key: "description", fallback: "Опис відсутній" },
                {
                    label: "Статус",
                    key: "status.name",
                    render: (data) => (
                        <Badge
                            variant={
                                data.status?.name?.toLowerCase() === "completed" ? "success" :
                                    data.status?.name?.toLowerCase() === "in progress" ? "primary" :
                                        data.status?.name?.toLowerCase() === "pending" ? "warning" :
                                            data.status?.name?.toLowerCase() === "canceled" ? "danger" :
                                                data.status?.name?.toLowerCase() === "paused" ? "warning" :
                                                    "default"
                            }
                            size="small"
                        >
                            {data.status?.name || "Невідомо"}
                        </Badge>
                    )
                },
                { label: "Тип проекту", key: "projectType.name", fallback: "—" }
            ]
        },
        {
            title: "Дати та фінанси",
            fields: [
                {
                    label: "Дата реєстрації",
                    key: "registrationDate",
                    render: (data) => formatDate(data.registrationDate)
                },
                {
                    label: "Дата початку",
                    key: "startDate",
                    render: (data) => data.startDate ? formatDate(data.startDate) : "—"
                },
                {
                    label: "Дата закінчення",
                    key: "endDate",
                    render: (data) => data.endDate ? formatDate(data.endDate) : "—"
                },
                {
                    label: "Кінцевий термін оплати",
                    key: "paymentDeadline",
                    render: (data) => data.paymentDeadline ? formatDate(data.paymentDeadline) : "—"
                },
                {
                    label: "Вартість",
                    key: "cost",
                    render: (data) => formatCurrency(data.cost)
                },
                {
                    label: "Орієнтовна вартість",
                    key: "estimateCost",
                    render: (data) => formatCurrency(data.estimateCost)
                }
            ]
        },
        {
            title: "Команда та сервіси",
            fields: [
                {
                    label: "Проектний менеджер",
                    key: "manager",
                    render: (data) => data.manager ? `${data.manager.name} ${data.manager.surname}` : "—"
                },
                {
                    label: "Сервіси",
                    key: "projectServices",
                    render: (data) => {
                        if (!data.projectServices || data.projectServices.length === 0) return "—";
                        return (
                            <div className="project-services-list">
                                {data.projectServices.map((service, index) => (
                                    <div key={index} className="project-service-item">
                                        {service.service?.serviceName || "Невідомий сервіс"}
                                    </div>
                                ))}
                            </div>
                        );
                    }
                }
            ]
        }
    ];

    const actions = [
        {
            label: "Закрити",
            variant: "outline",
            onClick: () => onClose()
        }
    ];

    // Додаємо кнопки управління статусом проекту, якщо проект має відповідний статус

    return (
        <DetailView
            data={project}
            sections={sections}
            title={`Проект: ${project.name}`}
            onClose={onClose}
            isModal={true}
            actions={actions}
        />
    );
}