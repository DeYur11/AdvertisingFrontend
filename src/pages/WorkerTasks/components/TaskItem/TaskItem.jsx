// src/pages/ServiceTrackerPage/components/TaskItem/TaskItem.jsx
import { useMutation, gql } from "@apollo/client";
import { highlightMatch } from "../../../../utils/highlightMatch";
import Badge from "../../../../components/common/Badge/Badge";
import "./TaskItem.css";
import {toast} from "react-toastify";

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

const uk = {
    priorityLabel: "Пріоритет:",
    deadlineLabel: "Термін:",
    status: {
        "completed": "Виконано",
        "in progress": "В процесі",
        "pending": "В очікуванні",
        "not started": "Не розпочато",
        "default": "Невідомо"
    },
    startButton: "Розпочати",
    finishButton: "Завершити",
};

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
                variables: { taskId: parseInt(task.id, 10), event: nextEvent },
                refetchQueries: ["PaginatedTasksByWorker"],
            });
        } catch (err) {
            toast.error("Не вдалося змінити статус:" + err.message)
        }
    }

    const statusKey = task.taskStatus?.name?.toLowerCase() || "";
    const badgeText = uk.status[statusKey] || uk.status.default;
    const badgeVariant =
        statusKey === "completed" ? "success" :
            statusKey === "in progress" ? "primary" :
                statusKey === "pending" ? "danger" :
                    "default";

    const formattedDeadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString("uk-UA")
        : "—";

    let priorityClass = "default";
    if (task.priority) {
        const priority = parseInt(task.priority, 10);
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
        const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        if (deadline < now) {
            deadlineClass = "deadline-passed";
        } else if (daysUntil <= 3) {
            deadlineClass = "deadline-soon";
        }
    }

    return (
        <div className={`task-item ${compact ? "compact" : ""}`} onClick={handleClick}>
            <div className="task-content">
                <div className="task-name">
                    {highlightMatch(task.name, searchQuery)}
                </div>

                {!compact && (
                    <div className="task-meta">
                        <div className="meta-item">
                            <span className="meta-label">{uk.priorityLabel}</span>
                            <Badge className={priorityClass} size="small">
                                {task.priority || "—"}
                            </Badge>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label">{uk.deadlineLabel}</span>
                            <span className={`meta-value ${deadlineClass}`}>
                                {formattedDeadline}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="task-controls">
                <Badge
                    className={`status-badge status-${statusKey || "default"}`}
                    variant={badgeVariant}
                    size={compact ? "small" : "medium"}
                >
                    {compact
                        ? badgeText
                        : (uk.status[statusKey] || task.taskStatus?.name || uk.status.default)
                    }
                </Badge>

                {!compact && (statusKey === "not started" || statusKey === "pending") && (
                    <button
                        className="task-action-btn"
                        onClick={(e) => handleStatusChange(e, "START")}
                    >
                        {uk.startButton}
                    </button>
                )}

                {!compact && statusKey === "in progress" && (
                    <button
                        className="task-action-btn"
                        onClick={(e) => handleStatusChange(e, "COMPLETE")}
                    >
                        {uk.finishButton}
                    </button>
                )}
            </div>
        </div>
    );
}
