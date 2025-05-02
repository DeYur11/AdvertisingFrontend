import { useState } from "react";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import TaskItem from "../TaskItem/TaskItem";
import "./ServiceInProgressItem.css";

export default function ServiceInProgressItem({
                                                  serviceInProgress,
                                                  searchQuery
                                              }) {
    const [expanded, setExpanded] = useState(false);

    // Get status for styling
    const status = serviceInProgress.status?.name?.toLowerCase() || "";

    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    // Format cost
    const formatCost = (cost) => {
        if (!cost) return "—";
        return `$${parseFloat(cost).toFixed(2)}`;
    };

    // Get active tasks count
    const activeTasks = serviceInProgress.tasks.filter(task => {
        const taskStatus = task.taskStatus?.name?.toLowerCase() || "";
        return taskStatus === "in progress" || taskStatus === "pending";
    }).length;

    return (
        <div className={`sip-item status-${status}`}>
            <div className="sip-main-info">
                <div className="sip-left">
                    <div className="sip-status">
                        <Badge
                            variant={
                                status === "completed" ? "success" :
                                    status === "in progress" ? "primary" :
                                        status === "pending" ? "warning" :
                                            "default"
                            }
                            size="small"
                        >
                            {serviceInProgress.status?.name || "Unknown"}
                        </Badge>
                    </div>

                    <div className="sip-dates">
                        <div className="sip-date-item">
                            <span className="date-label">Start:</span>
                            <span className="date-value">{formatDate(serviceInProgress.startDate)}</span>
                        </div>
                        <div className="sip-date-item">
                            <span className="date-label">End:</span>
                            <span className="date-value">{formatDate(serviceInProgress.endDate)}</span>
                        </div>
                    </div>
                </div>

                <div className="sip-right">
                    <div className="sip-cost">
                        <span className="cost-value">{formatCost(serviceInProgress.cost)}</span>
                    </div>

                    <div className="sip-tasks-count">
                        <span className="tasks-count">{serviceInProgress.tasks.length}</span>
                        <span className="tasks-label">Tasks</span>
                        {activeTasks > 0 && (
                            <Badge variant="primary" size="small" className="active-tasks-badge">
                                {activeTasks} active
                            </Badge>
                        )}
                    </div>

                    <div className="sip-actions">
                        <Button
                            variant="outline"
                            size="small"
                            icon="✏️"
                            className="sip-action-btn"
                        >
                            Edit
                        </Button>

                        <Button
                            variant={expanded ? "primary" : "outline"}
                            size="small"
                            icon={expanded ? "🔽" : "🔼"}
                            className="sip-action-btn"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? "Hide" : "Tasks"}
                        </Button>
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="sip-tasks">
                    <div className="tasks-header">
                        <h6 className="tasks-title">Tasks</h6>
                        <Button
                            variant="primary"
                            size="small"
                            icon="➕"
                            className="add-task-btn"
                        >
                            Add Task
                        </Button>
                    </div>

                    {serviceInProgress.tasks.length > 0 ? (
                        <div className="tasks-list">
                            {serviceInProgress.tasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    searchQuery={searchQuery}
                                    compact={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-tasks-message">
                            No tasks found. Click "Add Task" to create a new task.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}