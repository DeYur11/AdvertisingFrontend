import { useMutation, gql } from "@apollo/client";
import { highlightMatch } from "../../../../utils/highlightMatch";
import Badge from "../../../../components/common/Badge/Badge";
import "./TaskItem.css";

const TRANSITION_TASK_STATUS = gql`
    mutation TransitionTaskStatus($taskId: Int!, $event: String!) {
        transitionTaskStatus(input: { taskId: $taskId, event: $event }) {
            id
            taskStatus {
                name
            }
        }
    }
`;

export default function TaskItem({ task, searchQuery, onSelect, compact = false }) {
    const [transitionTaskStatus] = useMutation(TRANSITION_TASK_STATUS);

    function handleClick(event) {
        event.stopPropagation();
        onSelect({ type: "task", data: task });
    }

    async function handleStatusChange(event, nextEvent) {
        event.stopPropagation();
        try {
            await transitionTaskStatus({
                variables: {
                    taskId: parseInt(task.id),
                    event: nextEvent
                },
                refetchQueries: ["PaginatedTasksByWorker"]
            });
        } catch (err) {
            console.error("Failed to transition status:", err.message);
        }
    }

    const status = task.taskStatus?.name?.toLowerCase() || "";
    const formattedDeadline = task.deadline ? new Date(task.deadline).toLocaleDateString() : "—";

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
        <div className={`task-item ${compact ? 'compact' : ''}`} onClick={handleClick}>
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

            <div className="task-controls">
                <Badge
                    className={`status-badge status-${status}`}
                    variant={
                        status === "completed" ? "success" :
                            status === "in progress" ? "primary" :
                                status === "pending" ? "danger" :
                                    "default"
                    }
                    size={compact ? "small" : "medium"}
                >
                    {compact ? (
                        status === "in progress" ? "In Progress" :
                            status === "completed" ? "Done" :
                                status === "pending" ? "Pending" :
                                    task.taskStatus?.name || "Unknown"
                    ) : (
                        task.taskStatus?.name || "Unknown"
                    )}
                </Badge>

                {!compact && (
                    (status === "not started" || status === "pending") && (
                        <button
                            className="task-action-btn"
                            onClick={(e) => handleStatusChange(e, "START")}
                        >
                            Start
                        </button>
                    )
                )}

                {!compact && status === "in progress" && (
                    <button
                        className="task-action-btn"
                        onClick={(e) => handleStatusChange(e, "COMPLETE")}
                    >
                        Finish
                    </button>
                )}
            </div>
        </div>
    );
}
