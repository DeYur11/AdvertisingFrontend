import Card from "../../../../../components/common/Card/Card";
import Badge from "../../../../../components/common/Badge/Badge";

import "./ServiceDetails.css";
import TaskCard from "../../TaskCard/TaskCard";

export default function ServiceDetails({ data }) {
    const tasks = data.tasks || [];

    const sortedTasks = [...tasks].sort((a, b) => {
        const statusA = a.taskStatus?.name?.toLowerCase() || "";
        const statusB = b.taskStatus?.name?.toLowerCase() || "";

        if (statusA === "in progress" && statusB !== "in progress") return -1;
        if (statusB === "in progress" && statusA !== "in progress") return 1;
        if (statusA === "pending" && statusB === "completed") return -1;
        if (statusB === "pending" && statusA === "completed") return 1;

        return 0;
    });

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
                        {sortedTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
