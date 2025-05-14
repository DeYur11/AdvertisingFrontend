// src/pages/ServiceTrackerPage/components/TaskItem/TaskItem.jsx
import React from "react";
import { highlightMatch } from "../../../../utils/highlightMatch";
import Badge from "../../../../components/common/Badge/Badge";
import "./TaskItem.css";

const uk = {
    priorityLabel: "Пріоритет:",
    deadlineLabel: "Термін:",
    status: {
        completed: "Виконано",
        "in progress": "В процесі",
        pending: "В очікуванні",
        unknown: "Невідомо",
    },
};

export default function TaskItem({
                                     task,
                                     searchQuery,
                                     compact = false,
                                 }) {
    const statusKey = task.taskStatus?.name?.toLowerCase() || "";
    const formattedDeadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString("uk-UA")
        : "—";

    // Define priority display class
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

    // Determine deadline status class
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

    // Determine badge text
    const badgeText = compact
        ? (
            uk.status[statusKey] ||
            uk.status.unknown
        )
        : task.taskStatus?.name || uk.status.unknown;

    // Determine badge variant
    const badgeVariant =
        statusKey === "completed"
            ? "success"
            : statusKey === "in progress"
                ? "primary"
                : statusKey === "pending"
                    ? "warning"
                    : "default";

    return (
        <div className={`task-item ${compact ? "compact" : ""}`}>
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

            <div className="task-status">
                <Badge
                    className={`status-badge status-${statusKey || "unknown"}`}
                    variant={badgeVariant}
                    size={compact ? "small" : "medium"}
                >
                    {badgeText}
                </Badge>
            </div>
        </div>
    );
}
