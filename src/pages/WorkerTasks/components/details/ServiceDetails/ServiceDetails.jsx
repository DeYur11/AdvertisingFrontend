import Card from "../../../../../components/common/Card/Card";
import Badge from "../../../../../components/common/Badge/Badge";
import TaskCard from "../../TaskCard/TaskCard";

import "./ServiceDetails.css";

export default function ServiceDetails({ data }) {
    const tasks = data.tasks || [];

    // Sort tasks by status for better presentation
    const sortedTasks = [...tasks].sort((a, b) => {
        const statusA = a.taskStatus?.name?.toLowerCase() || "";
        const statusB = b.taskStatus?.name?.toLowerCase() || "";

        if (statusA === "in progress" && statusB !== "in progress") return -1;
        if (statusB === "in progress" && statusA !== "in progress") return 1;
        if (statusA === "pending" && statusB === "completed") return -1;
        if (statusB === "pending" && statusA === "completed") return 1;

        return 0;
    });

    // Calculate task statistics
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(task => {
        const status = task.taskStatus?.name?.toLowerCase() || "";
        return status === "in progress" || status === "pending";
    }).length;
    const completedTasks = tasks.filter(task => {
        const status = task.taskStatus?.name?.toLowerCase() || "";
        return status === "completed";
    }).length;

    return (
        <div className="service-details">
            <Card className="info-card">
                <div className="service-header">
                    <h2 className="service-name">{data.serviceName}</h2>
                    {data.serviceType?.name && (
                        <Badge className="service-type">
                            {data.serviceType.name}
                        </Badge>
                    )}
                </div>

                {data.description && (
                    <div className="service-description">
                        <h3 className="section-title">Опис</h3>
                        <div className="description-content">{data.description}</div>
                    </div>
                )}

                <div className="service-details-grid">
                    <div className="details-col">
                        <h3 className="section-title">Деталі сервісу</h3>
                        <div className="detail-item">
                            <div className="detail-label">Орієнтовна вартість</div>
                            <div className="detail-value cost">
                                {data.estimateCost || "—"}
                            </div>
                        </div>
                    </div>

                    <div className="details-col">
                        <h3 className="section-title">Статистика завдань</h3>
                        <div className="task-stats">
                            <div className="stat-item">
                                <div className="stat-value">{totalTasks}</div>
                                <div className="stat-label">Всього</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value active">{activeTasks}</div>
                                <div className="stat-label">Активні</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value completed">{completedTasks}</div>
                                <div className="stat-label">Завершені</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {tasks.length > 0 && (
                <div className="related-tasks-section">
                    <h3 className="section-title">Пов'язані завдання</h3>
                    <div className="tasks-list">
                        {sortedTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </div>
            )}

            {tasks.length === 0 && (
                <Card className="empty-state-card">
                    <div className="empty-icon">📋</div>
                    <h4>Немає активних завдань</h4>
                    <p className="empty-message">Для цього сервісу ще не створено завдань.</p>
                </Card>
            )}
        </div>
    );
}