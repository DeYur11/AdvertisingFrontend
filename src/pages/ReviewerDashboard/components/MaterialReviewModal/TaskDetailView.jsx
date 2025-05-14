import DetailView from "../../../../components/common/DetailView/DetailView";
import Badge from "../../../../components/common/Badge/Badge";
import { formatDate } from "../../utils/reviewerUtils";
import "./ClickableLinks.css";

export default function TaskDetailView({ task, onClose }) {
    if (!task) return null;

    // Визначаємо варіант Badge для пріоритету
    const getPriorityBadgeVariant = (priority) => {
        if (priority >= 8) return "danger";
        if (priority >= 4) return "warning";
        return "success";
    };

    const sections = [
        {
            title: "Інформація про завдання",
            fields: [
                { label: "Назва завдання", key: "name" },
                { label: "Опис", key: "description", fallback: "Опис відсутній" },
                {
                    label: "Статус",
                    key: "taskStatus.name",
                    render: (data) => (
                        <Badge
                            variant={
                                data.taskStatus?.name?.toLowerCase() === "completed" ? "success" :
                                    data.taskStatus?.name?.toLowerCase() === "in progress" ? "primary" :
                                        data.taskStatus?.name?.toLowerCase() === "pending" ? "warning" :
                                            data.taskStatus?.name?.toLowerCase() === "canceled" ? "danger" :
                                                data.taskStatus?.name?.toLowerCase() === "paused" ? "warning" :
                                                    "default"
                            }
                            size="small"
                        >
                            {data.taskStatus?.name || "Невідомо"}
                        </Badge>
                    )
                },
                {
                    label: "Пріоритет",
                    key: "priority",
                    render: (data) => (
                        data.priority ? (
                            <Badge
                                variant={getPriorityBadgeVariant(parseInt(data.priority, 10))}
                                size="medium"
                            >
                                {data.priority}
                            </Badge>
                        ) : "—"
                    )
                },
                {
                    label: "Вартість",
                    key: "value",
                    render: (data) => {
                        if (data.value === null || data.value === undefined) return "—";
                        return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(data.value);
                    }
                }
            ]
        },
        {
            title: "Терміни виконання",
            fields: [
                {
                    label: "Дата створення",
                    key: "createDatetime",
                    render: (data) => formatDate(data.createDatetime)
                },
                {
                    label: "Дата початку",
                    key: "startDate",
                    render: (data) => data.startDate ? formatDate(data.startDate) : "—"
                },
                {
                    label: "Дедлайн",
                    key: "deadline",
                    render: (data) => data.deadline ? formatDate(data.deadline) : "—"
                },
                {
                    label: "Завершено",
                    key: "endDate",
                    render: (data) => data.endDate ? formatDate(data.endDate) : "—"
                },
                {
                    label: "Оновлено",
                    key: "updateDatetime",
                    render: (data) => data.updateDatetime ? formatDate(data.updateDatetime) : "—"
                }
            ]
        },
        {
            title: "Пов'язана інформація",
            fields: [
                {
                    label: "Виконавець",
                    key: "assignedWorker",
                    render: (data) => data.assignedWorker ? `${data.assignedWorker.name} ${data.assignedWorker.surname}` : "—"
                },
                {
                    label: "Сервіс",
                    key: "serviceInProgress.projectService.service.serviceName",
                    fallback: "—"
                },
                {
                    label: "Проект",
                    key: "serviceInProgress.projectService.project.name",
                    render: (data) => {
                        const project = data.serviceInProgress?.projectService?.project;
                        return project?.name || "—";
                    }
                },
                {
                    label: "Клієнт",
                    key: "serviceInProgress.projectService.project.client.name",
                    render: (data) => {
                        const client = data.serviceInProgress?.projectService?.project?.client;
                        return client?.name || "—";
                    }
                }
            ]
        }
    ];

    // Додамо розділ для пов'язаних матеріалів, якщо вони існують
    if (task.materials && task.materials.length > 0) {
        sections.push({
            title: "Пов'язані матеріали",
            content: (data) => (
                <div className="related-materials-list">
                    {data.materials.map((material, index) => (
                        <div key={material.id || index} className="related-material-item">
                            <span className="material-name">{material.name}</span>
                            {material.status && (
                                <Badge
                                    variant={
                                        material.status.name?.toLowerCase() === "accepted" ? "success" :
                                            material.status.name?.toLowerCase() === "rejected" ? "danger" :
                                                material.status.name?.toLowerCase() === "pending review" ? "warning" :
                                                    "default"
                                    }
                                    size="small"
                                >
                                    {material.status.name}
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            )
        });
    }

    const actions = [
        {
            label: "Закрити",
            variant: "outline",
            onClick: () => onClose()
        }
    ];

    return (
        <DetailView
            data={task}
            sections={sections}
            title={`Завдання: ${task.name}`}
            onClose={onClose}
            isModal={true}
            actions={actions}
        />
    );
}