// src/pages/ServiceTracker/components/TaskItem/TaskItem.jsx
import Button from "../../../../components/common/Button/Button";
import { getWorkerNameById } from "../../utils/serviceUtils";
import "./TaskItem.css";

export default function TaskItem({ task, index, onEdit, onRemove }) {
    const handleEdit = () => {
        onEdit(index);
    };

    const handleRemove = () => {
        onRemove(index);
    };

    return (
        <div className="task-list-item">
            <div className="task-info">
                <div className="task-name">{task.name}</div>
                <div className="task-details">
                    <span className="task-detail">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">{new Date(task.deadline).toLocaleDateString()}</span>
                    </span>
                    <span className="task-detail">
                        <span className="detail-label">Assigned to:</span>
                        <span className="detail-value">{task.assignedWorkerName || "Unknown"}</span>
                    </span>
                    {task.priority && (
                        <span className="task-detail">
                            <span className="detail-label">Priority:</span>
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
                    Edit
                </Button>
                <Button
                    variant="danger"
                    size="small"
                    type="button"
                    onClick={handleRemove}
                >
                    Remove
                </Button>
            </div>
        </div>
    );
}