import { highlightMatch } from "../../../../utils/highlightMatch";
import Badge from "../../../../components/common/Badge/Badge";
import Card from "../../../../components/common/Card/Card";
import "./TaskItem.css";

export default function TaskItem({ task, searchQuery, onSelect }) {
    if (!task || !task.name) return null;

    const status = task.taskStatus?.name?.toLowerCase() || "unknown";
    const statusClass = status.replace(/\s+/g, "-"); // E.g., "in progress" → "in-progress"
    const priority = parseInt(task.priority);

    // Determine badge variant based on status
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

    // Determine deadline class
    const getDeadlineClass = () => {
        if (!task.deadline) return "";

        const now = new Date();
        const deadline = new Date(task.deadline);
        const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        if (deadline < now) {
            return "deadline-passed";
        } else if (daysUntilDeadline <= 3) {
            return "deadline-soon";
        }
        return "";
    };

    // Format date to display
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Card
            className={`task-item status-${statusClass}`}
            onClick={onSelect}
            hoverable
        >
            <div className="task-item-content">
                <div className="task-header">
                    <div className="task-name">
                        {highlightMatch(task.name, searchQuery)}
                    </div>
                    <Badge variant={badgeVariant}>
                        {task.taskStatus?.name || "Unknown"}
                    </Badge>
                </div>

                {task.description && (
                    <div className="task-description">
                        {task.description.length > 100
                            ? `${task.description.substring(0, 100)}...`
                            : task.description}
                    </div>
                )}

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
                            <span className={`meta-value ${getDeadlineClass()}`}>
                                {formatDate(task.deadline)}
                            </span>
                        </div>
                    )}

                    {task.serviceInProgress?.projectService?.project && (
                        <div className="meta-item">
                            <span className="meta-label">Project:</span>
                            <span className="meta-value">
                                {task.serviceInProgress.projectService.project.name}
                            </span>
                        </div>
                    )}

                    {task.serviceInProgress?.projectService?.service && (
                        <div className="meta-item">
                            <span className="meta-label">Service:</span>
                            <span className="meta-value">
                                {task.serviceInProgress.projectService.service.serviceName}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}