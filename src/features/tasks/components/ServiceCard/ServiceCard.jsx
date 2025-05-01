import { highlightMatch } from "../../../../utils/highlightMatch";
import TaskItem from "../TaskItem/TaskItem";
import Badge from "../../../../components/common/Badge/Badge";
import "./ServiceCard.css";

export default function ServiceCard({ service, searchQuery, onSelect }) {
    const tasks = service.filteredTasks ?? [];

    return (
        <div className="service-card" onClick={() => onSelect({ type: "service", data: service })}>
            <div className="service-header">
                <div className="service-info">
                    <div className="service-title">
                        {highlightMatch(service.serviceName, searchQuery)}
                    </div>
                    <div className="service-type">
                        {service.serviceType?.name && (
                            <Badge size="small" className="service-type-badge">
                                {service.serviceType.name}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="task-counter">
                    <span className="count">{tasks.length}</span>
                    <span className="label">{tasks.length === 1 ? 'task' : 'tasks'}</span>
                </div>
            </div>

            <div className="tasks-list">
                {tasks.length > 0 ? (
                    <div className="tasks-grid">
                        {tasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                searchQuery={searchQuery}
                                onSelect={onSelect}
                                compact={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-tasks">No tasks available</div>
                )}
            </div>
        </div>
    );
}