import React from "react";
import Badge from "../../../../../components/common/Badge/Badge";
import Card from "../../../../../components/common/Card/Card";
import "./TaskInfoTab.css";

export default function TaskInfoTab({ data }) {
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Check if deadline is passed or approaching
    const getDeadlineClass = () => {
        if (!data.deadline) return "";

        const now = new Date();
        const deadline = new Date(data.deadline);
        const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        if (deadline < now) return "overdue";
        if (daysUntil <= 3) return "soon";
        return "";
    };

    const priority = parseInt(data.priority || 0);
    const priorityClass =
        priority >= 8 ? "priority-high" :
            priority >= 4 ? "priority-medium" :
                "priority-low";

    const statusKey = data.taskStatus?.name?.toLowerCase() || "";

    return (
        <div className="task-info-tab">
            {data.description && (
                <div className="description-section">
                    <h3 className="section-title">Опис завдання</h3>
                    <div className="task-description">
                        {data.description}
                    </div>
                </div>
            )}

            <div className="task-info-grid">
                <Card className="info-section">
                    <h3 className="section-title">Деталі завдання</h3>

                    <div className="info-item">
                        <div className="info-label">Пріоритет:</div>
                        <div className="info-value">
                            <Badge className={priorityClass} size="medium">
                                {data.priority || "—"}
                            </Badge>
                        </div>
                    </div>

                    {data.value && (
                        <div className="info-item">
                            <div className="info-label">Вартість:</div>
                            <div className="info-value value">{data.value}</div>
                        </div>
                    )}

                    <div className="info-item">
                        <div className="info-label">Статус:</div>
                        <div className="info-value">
                            <Badge
                                variant={
                                    statusKey === "completed" ? "success" :
                                        statusKey === "in progress" ? "primary" :
                                            statusKey === "pending" ? "danger" :
                                                "default"
                                }
                            >
                                {data.taskStatus?.name || "Невідомо"}
                            </Badge>
                        </div>
                    </div>
                </Card>

                <Card className="info-section">
                    <h3 className="section-title">Терміни</h3>

                    {data.startDate && (
                        <div className="info-item">
                            <div className="info-label">Дата початку:</div>
                            <div className="info-value">{formatDate(data.startDate)}</div>
                        </div>
                    )}

                    <div className="info-item">
                        <div className="info-label">Дедлайн:</div>
                        <div className={`info-value deadline ${getDeadlineClass()}`}>
                            {formatDate(data.deadline)}
                        </div>
                    </div>

                    {data.endDate && (
                        <div className="info-item">
                            <div className="info-label">Дата завершення:</div>
                            <div className="info-value">{formatDate(data.endDate)}</div>
                        </div>
                    )}
                </Card>
            </div>

            {data.serviceInProgress?.projectService?.project && (
                <Card className="info-section project-section">
                    <h3 className="section-title">Інформація про проект</h3>

                    <div className="info-item">
                        <div className="info-label">Проект:</div>
                        <div className="info-value project-name">
                            {data.serviceInProgress.projectService.project.name}
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">Сервіс:</div>
                        <div className="info-value service-name">
                            {data.serviceInProgress.projectService.service.serviceName}
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">Клієнт:</div>
                        <div className="info-value">
                            {data.serviceInProgress.projectService.project.client?.name || "—"}
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">Менеджер:</div>
                        <div className="info-value">
                            {data.serviceInProgress.projectService.project.manager ?
                                `${data.serviceInProgress.projectService.project.manager.name} ${data.serviceInProgress.projectService.project.manager.surname}` :
                                "—"
                            }
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}