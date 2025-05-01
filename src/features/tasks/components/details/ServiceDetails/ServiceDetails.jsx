import Card from "../../../../../components/common/Card/Card";
import Badge from "../../../../../components/common/Badge/Badge";
import Button from "../../../../../components/common/Button/Button";
import "./ServiceDetails.css";

export default function ServiceDetails({ data }) {
    // Get related tasks if available
    const tasks = data.tasks || [];

    // Sort tasks by status (active first)
    const sortedTasks = [...tasks].sort((a, b) => {
        const statusA = a.taskStatus?.name?.toLowerCase() || "";
        const statusB = b.taskStatus?.name?.toLowerCase() || "";

        // In progress first, then pending, then completed
        if (statusA === "in progress" && statusB !== "in progress") return -1;
        if (statusB === "in progress" && statusA !== "in progress") return 1;
        if (statusA === "pending" && statusB === "completed") return -1;
        if (statusB === "pending" && statusA === "completed") return 1;

        return 0;
    });

    // Calculate task statistics
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(task => {
        const status = task.taskStatus?.name?.toLowerCase() || "";
        return status === "in progress" || status === "pending";
    }).length;
    const completedTasks = tasks.filter(task => {
        const status = task.taskStatus?.name?.toLowerCase() || "";
        return status === "completed";
    }).length;

    return (
        <div className="service-details">
            <Card className="info-card">
                <div className="service-header">
                    <h2 className="service-name">{data.serviceName}</h2>
                    {data.serviceType?.name && (
                        <Badge className="service-type">
                            {data.serviceType.name}
                        </Badge>
                    )}
                </div>

                {data.description && (
                    <div className="service-description">
                        <h3 className="section-title">Description</h3>
                        <div className="description-content">{data.description}</div>
                    </div>
                )}

                <div className="service-details-grid">
                    <div className="details-col">
                        <h3 className="section-title">Service Details</h3>

                        <div className="detail-item">
                            <div className="detail-label">Estimated Cost</div>
                            <div className="detail-value cost">
                                {data.estimateCost ? `$${data.estimateCost}` : "—"}
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-label">Duration</div>
                            <div className="detail-value">
                                {data.duration ? `${data.duration} days` : "—"}
                            </div>
                        </div>
                    </div>

                    <div className="details-col">
                        <h3 className="section-title">Task Statistics</h3>

                        <div className="task-stats">
                            <div className="stat-item">
                                <div className="stat-value">{totalTasks}</div>
                                <div className="stat-label">Total Tasks</div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-value active">{activeTasks}</div>
                                <div className="stat-label">Active</div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-value completed">{completedTasks}</div>
                                <div className="stat-label">Completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {tasks.length > 0 && (
                <div className="related-tasks-section">
                    <h3 className="section-title">Related Tasks</h3>

                    <div className="tasks-list">
                        {sortedTasks.map(task => {
                            const status = task.taskStatus?.name?.toLowerCase() || "";

                            return (
                                <Card
                                    key={task.id}
                                    className={`task-card status-${status}`}
                                    variant="outlined"
                                >
                                    <div className="task-card-header">
                                        <div className="task-name">{task.name}</div>
                                        <Badge
                                            variant={
                                                status === "completed" ? "success" :
                                                    status === "in progress" ? "primary" :
                                                        status === "pending" ? "danger" :
                                                            "default"
                                            }
                                        >
                                            {task.taskStatus?.name || "Unknown"}
                                        </Badge>
                                    </div>

                                    <div className="task-meta">
                                        {task.priority && (
                                            <div className="meta-item">
                                                <span className="meta-label">Priority:</span>
                                                <Badge
                                                    className={
                                                        parseInt(task.priority) >= 8 ? "priority-high" :
                                                            parseInt(task.priority) >= 4 ? "priority-medium" :
                                                                "priority-low"
                                                    }
                                                    size="small"
                                                >
                                                    {task.priority}
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
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}