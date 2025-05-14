// src/pages/ServiceTrackerPage/components/TaskItem/TaskItem.jsx
import React from "react";
import Button from "../../../../components/common/Button/Button";
import { getWorkerNameById } from "../../utils/serviceUtils";
import "./TaskItem.css";

const uk = {
    deadlineLabel: "Термін:",
    assignedLabel: "Відповідальний:",
    priorityLabel: "Пріоритет:",
    edit: "Редагувати",
    remove: "Видалити",
    unknown: "Невідомо",
};

export default function TaskItem({ task, index, onEdit, onRemove }) {
    const handleEdit = () => {
        onEdit(index);
    };

    const handleRemove = () => {
        onRemove(index);
    };

    const formattedDeadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString("uk-UA")
        : "—";

    const assignedName =
        task.assignedWorkerName ||
        getWorkerNameById(task.assignedWorkerId) ||
        uk.unknown;

    return (
        <div className="task-list-item">
            <div className="task-info">
                <div className="task-name">{task.name}</div>
                <div className="task-details">
          <span className="task-detail">
            <span className="detail-label">{uk.deadlineLabel}</span>
            <span className="detail-value">{formattedDeadline}</span>
          </span>
                    <span className="task-detail">
            <span className="detail-label">{uk.assignedLabel}</span>
            <span className="detail-value">{assignedName}</span>
          </span>
                    {task.priority && (
                        <span className="task-detail">
              <span className="detail-label">{uk.priorityLabel}</span>
              <span className="detail-value">{task.priority}</span>
            </span>
                    )}
                </div>
                {task.description && (
                    <div className="task-description">{task.description}</div>
                )}
            </div>
            <div className="task-actions">
                <Button
                    variant="outline"
                    size="small"
                    type="button"
                    onClick={handleEdit}
                >
                    {uk.edit}
                </Button>
                <Button
                    variant="danger"
                    size="small"
                    type="button"
                    onClick={handleRemove}
                >
                    {uk.remove}
                </Button>
            </div>
        </div>
    );
}
