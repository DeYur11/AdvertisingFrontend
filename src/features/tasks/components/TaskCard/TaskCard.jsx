import "./TaskCard.css";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";

export default function TaskCard({ task }) {
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

    return (
        <Card className={`task-card status-${statusClass}`} variant="outlined">
            <div className="task-card-header">
                <div className="task-name">{task.name}</div>
                <Badge variant={badgeVariant}>
                    {task.taskStatus?.name || "Unknown"}
                </Badge>
            </div>

            <div className="task-meta">
                {Number.isFinite(priority) && (
                    <div className="meta-item">
                        <span className="meta-label">Priority:</span>
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
                        <span className="meta-label">Deadline:</span>
                        <span className="meta-value">
                            {new Date(task.deadline).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
}
