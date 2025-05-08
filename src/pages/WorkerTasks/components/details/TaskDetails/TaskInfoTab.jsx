import Card from "../../../../../components/common/Card/Card";
import Badge from "../../../../../components/common/Badge/Badge";

export default function TaskInfoTab({ data }) {
    const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

    const priority = parseInt(data.priority || 0);
    const priorityClass =
        priority >= 8 ? "priority-high" :
            priority >= 4 ? "priority-medium" :
                "priority-low";

    return (
        <Card>
            <div className="flex items-center justify-between mb-2">
                <h2>{data.name}</h2>
                <Badge
                    variant={
                        data.taskStatus?.name?.toLowerCase() === "completed" ? "success" :
                            data.taskStatus?.name?.toLowerCase() === "in progress" ? "primary" :
                                data.taskStatus?.name?.toLowerCase() === "pending" ? "danger" :
                                    "default"
                    }
                >
                    {data.taskStatus?.name || "Unknown"}
                </Badge>
            </div>

            {data.description && (
                <div className="mb-2">
                    <h3>Description</h3>
                    <p>{data.description}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4>Details</h4>
                    <p>Priority: <Badge className={priorityClass}>{data.priority || "—"}</Badge></p>
                    <p>Value: {data.value ? `$${data.value}` : "—"}</p>
                </div>
                <div>
                    <h4>Dates</h4>
                    <p>Start: {formatDate(data.startDate)}</p>
                    <p>Deadline: {formatDate(data.deadline)}</p>
                    {data.endDate && <p>End: {formatDate(data.endDate)}</p>}
                </div>
            </div>
        </Card>
    );
}
