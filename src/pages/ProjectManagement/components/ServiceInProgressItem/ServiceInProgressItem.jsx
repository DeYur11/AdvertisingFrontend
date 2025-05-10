import Card from "../../../../components/common/Card/Card";
import StatusBadge from "../../../../components/common/StatusBadge/StatusBadge";
import InfoRow from "../../../../components/common/InfoRow/InfoRow";
import { CalendarMonth, MonetizationOn, ListAlt } from "@mui/icons-material";
import "./ServiceInProgressItem.css";

export default function ServiceInProgressItem({ serviceInProgress, onShowDetails }) {
    const status = serviceInProgress.status?.name || "Невідомо";

    // Форматування дат
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    // Розрахунок статистики виконання задач
    const totalTasks = serviceInProgress.tasks?.length || 0;
    const completedTasks = serviceInProgress.tasks?.filter(
        task => task.taskStatus?.name?.toLowerCase() === "completed"
    ).length || 0;
    const taskCompletionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const handleClick = (e) => {
        e.stopPropagation();
        if (onShowDetails) {
            onShowDetails(serviceInProgress);
        }
    };

    // Визначення варіанта статус-бейджа
    const getStatusVariant = (status) => {
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus.includes("completed") || normalizedStatus.includes("завершено")) {
            return "success";
        } else if (normalizedStatus.includes("progress") || normalizedStatus.includes("процес")) {
            return "primary";
        } else {
            return "warning";
        }
    };

    return (
        <Card
            variant="outlined"
            className="sip-item"
            onClick={handleClick}
        >
            <div className="sip-header">
                <StatusBadge
                    status={status}
                    type="service"
                    size="small"
                    variant={getStatusVariant(status)}
                />

                <h4 className="sip-title">
                    {serviceInProgress.projectService?.service?.serviceName || "Реалізація сервісу"}
                </h4>

                <div className="sip-view-details">Переглянути деталі</div>
            </div>

            <div className="sip-content">
                <div className="sip-info-rows">
                    <InfoRow
                        icon={<CalendarMonth fontSize="small"/>}
                        label="Період:"
                        value={`${formatDate(serviceInProgress.startDate)} — ${formatDate(serviceInProgress.endDate)}`}
                    />

                    <InfoRow
                        icon={<MonetizationOn fontSize="small"/>}
                        label="Вартість:"
                        value={
                            serviceInProgress.cost != null
                                ? `₴${(+serviceInProgress.cost).toFixed(2)}`
                                : "—"}
                    />

                    <InfoRow
                        icon={<ListAlt fontSize="small"/>}
                        label="Задачі:"
                        value={`${completedTasks}/${totalTasks} виконано`}
                    />
                </div>

                {totalTasks > 0 && (
                    <div className="task-progress">
                        <div className="progress-label">
                            <span>Виконання задач</span>
                            <span>{taskCompletionPercent}%</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className={`progress-fill ${status.toLowerCase().includes("completed") ? "status-completed" :
                                    status.toLowerCase().includes("progress") ? "status-in-progress" : "status-pending"}`}
                                style={{ width: `${taskCompletionPercent}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}