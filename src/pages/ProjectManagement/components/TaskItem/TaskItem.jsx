import { highlightMatch } from "../../../../utils/highlightMatch";
import Badge from "../../../../components/common/Badge/Badge";
import "./TaskItem.css";

export default function TaskItem({
                                     task,
                                     searchQuery,
                                     compact = false
                                 }) {
    const status = task.taskStatus?.name?.toLowerCase() || "";
    const formattedDeadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString()
        : "—";

    // Define priority display and class
    let priorityClass = "default";

    if (task.priority) {
        const priority = parseInt(task.priority);

        if (priority >= 8) {
            priorityClass = "priority-high";
        } else if (priority >= 4) {
            priorityClass = "priority-medium";
        } else {
            priorityClass = "priority-low";
        }
    }

    // Determine if task deadline is approaching or passed
    let deadlineClass = "";
    if (task.deadline) {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        if (deadline < now) {
            deadlineClass = "deadline-passed";
        } else if (daysUntilDeadline <= 3) {
            deadlineClass = "deadline-soon";
        }
    }

    return (
        <div className={`task-item ${compact ? 'compact' : ''}`}>
            <div className="task-content">
                <div className="task-name">
                    {highlightMatch(task.name, searchQuery)}
                </div>

                {!compact && (
                    <div className="task-meta">
                        <div className="meta-item">
                            <span className="meta-label">Priority:</span>
                            <Badge className={priorityClass} size="small">
                                {task.priority || "—"}
                            </Badge>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label">Deadline:</span>
                            <span className={`meta-value ${deadlineClass}`}>
                {formattedDeadline}
              </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="task-status">
                <Badge
                    className={`status-badge status-${status}`}
                    variant={
                        status === "completed" ? "success" :
                            status === "in progress" ? "primary" :
                                status === "pending" ? "warning" :
                                    "default"
                    }
                    size={compact ? "small" : "medium"}
                >
                    {compact ?
                        (status === "in progress" ? "In Progress" :
                            status === "completed" ? "Done" :
                                status === "pending" ? "Pending" : task.taskStatus?.name || "Unknown") :
                        task.taskStatus?.name || "Unknown"
                    }
                </Badge>
            </div>
        </div>
    );
}