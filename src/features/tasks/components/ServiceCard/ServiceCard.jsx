import { highlightMatch } from "../../../../utils/highlightMatch";
import TaskItem from "../TaskItem/TaskItem";
import "./ServiceCard.css";

export default function ServiceCard({ service, searchQuery, onSelect }) {
    const tasks = service.filteredTasks ?? [];

    return (
        <div className="service-card" onClick={() => onSelect({ type: "service", data: service })}>
            <div className="service-header">
                <div className="service-title">
                    {highlightMatch(service.serviceName, searchQuery)}
                </div>
                <div className="service-type">
                    <span className="service-type-label">Type:</span>
                    <span className="service-type-value">{service.serviceType?.name ?? "—"}</span>
                </div>
            </div>

            <div className="tasks-list">
                {tasks.length > 0 ? (
                    <>
                        <div className="tasks-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</div>
                        {tasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                searchQuery={searchQuery}
                                onSelect={onSelect}
                            />
                        ))}
                    </>
                ) : (
                    <div className="no-tasks">No tasks available</div>
                )}
            </div>

            <div className="service-card-footer">
                <button
                    className="view-details-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect({ type: "service", data: service });
                    }}
                >
                    View Details
                </button>
            </div>
        </div>
    );
}