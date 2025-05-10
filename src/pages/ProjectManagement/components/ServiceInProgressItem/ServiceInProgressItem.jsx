import Card from "../../../../components/common/Card/Card";
import StatusBadge from "../../../../components/common/StatusBadge/StatusBadge";
import InfoRow from "../../../../components/common/InfoRow/InfoRow";
import { CalendarMonth, MonetizationOn, ListAlt } from "@mui/icons-material";
import "./ServiceInProgressItem.css";

export default function ServiceInProgressItem({ serviceInProgress, onShowDetails }) {
    const status = serviceInProgress.status?.name || "Unknown";

    // Format dates nicely
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    // Calculate task completion stats if tasks are available
    const totalTasks = serviceInProgress.tasks?.length || 0;
    const completedTasks = serviceInProgress.tasks?.filter(
        task => task.taskStatus?.name?.toLowerCase() === "completed"
    ).length || 0;
    const taskCompletionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const handleClick = (e) => {
        e.stopPropagation();
        if (onShowDetails) {
            onShowDetails(serviceInProgress);
        }
    };

    return (
        <Card
            variant="outlined"
            className="sip-item"
            onClick={handleClick}
        >
            <div className="sip-header">
                <StatusBadge
                    status={status}
                    type="service"
                    size="small"
                />

                <h4 className="sip-title">
                    {serviceInProgress.projectService?.service?.serviceName || "Service Implementation"}
                </h4>
            </div>

            <div className="sip-content">
                <div className="sip-info-rows">
                    <InfoRow
                        icon={<CalendarMonth fontSize="small"/>}
                        label="Period:"
                        value={`${formatDate(serviceInProgress.startDate)} — ${formatDate(serviceInProgress.endDate)}`}
                    />

                    <InfoRow
                        icon={<MonetizationOn fontSize="small"/>}
                        label="Cost:"
                        value={
                            serviceInProgress.cost != null
                                ? `$${(+serviceInProgress.cost).toFixed(2)}`
                                : "—"}
                    />

                    <InfoRow
                        icon={<ListAlt fontSize="small"/>}
                        label="Tasks:"
                        value={`${completedTasks}/${totalTasks} completed`}
                    />
                </div>

                {totalTasks > 0 && (
                    <div className="task-progress">
                        <div className="progress-label">
                            <span>Task Completion</span>
                            <span>{taskCompletionPercent}%</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${taskCompletionPercent}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}