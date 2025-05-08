import "./TaskCard.css";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button"; // Додаємо кнопку

export default function TaskCard({ task, onStatusChange }) {
    if (!task || !task.name) return null;

    const status = task.taskStatus?.name?.toLowerCase() || "unknown";
    const statusClass = status.replace(/\s+/g, "-"); // Наприклад, "in progress" → "in-progress"
    const priority = parseInt(task.priority);

    const badgeVariant = (() => {
        switch (status) {
            case "completed":
                return "success";
            case "in progress":
                return "primary";
            case "pending":
                return "danger";
            default:
                return "default";
        }
    })();

    // Функція для визначення наступного статусу
    const getNextStatus = () => {
        switch (status) {
            case "pending":
                return "in progress";
            case "in progress":
                return "completed";
            case "completed":
                return "pending";
            default:
                return "pending";
        }
    };

    // Обробник кліку по кнопці зміни статусу
    const handleStatusChange = (e) => {
        e.stopPropagation(); // Зупиняємо propagation, щоб не спрацював клік по картці
        if (onStatusChange) {
            onStatusChange(task.id, getNextStatus());
        }
    };

    // Текст кнопки в залежності від поточного статусу
    const getButtonText = () => {
        switch (status) {
            case "pending":
                return "Розпочати";
            case "in progress":
                return "Завершити";
            case "completed":
                return "Повернути";
            default:
                return "Змінити статус";
        }
    };

    // Варіант кнопки в залежності від наступного статусу
    const getButtonVariant = () => {
        const nextStatus = getNextStatus();
        switch (nextStatus) {
            case "in progress":
                return "primary";
            case "completed":
                return "success";
            case "pending":
                return "warning";
            default:
                return "default";
        }
    };

    return (
        <Card className={`task-card status-${statusClass}`} variant="outlined">
            <div className="task-card-header">
                <div className="task-name">{task.name}</div>
                <Badge variant={badgeVariant}>
                    {task.taskStatus?.name || "Unknown"}
                </Badge>
            </div>

            {task.description && (
                <div className="task-description">
                    {task.description}
                </div>
            )}

            <div className="task-meta">
                {Number.isFinite(priority) && (
                    <div className="meta-item">
                        <span className="meta-label">Пріоритет:</span>
                        <Badge
                            className={
                                priority >= 8
                                    ? "priority-high"
                                    : priority >= 4
                                        ? "priority-medium"
                                        : "priority-low"
                            }
                            size="small"
                        >
                            {priority}
                        </Badge>
                    </div>
                )}

                {task.deadline && (
                    <div className="meta-item">
                        <span className="meta-label">Дедлайн:</span>
                        <span className="meta-value deadline">
                            {new Date(task.deadline).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {task.assignedTo && (
                    <div className="meta-item">
                        <span className="meta-label">Виконавець:</span>
                        <span className="meta-value">
                            {task.assignedTo}
                        </span>
                    </div>
                )}
            </div>

            <div className="task-actions">
                <Button
                    onClick={handleStatusChange}
                    variant={getButtonVariant()}
                    size="small"
                    className="status-change-btn"
                >
                    {getButtonText()}
                </Button>
            </div>
        </Card>
    );
}