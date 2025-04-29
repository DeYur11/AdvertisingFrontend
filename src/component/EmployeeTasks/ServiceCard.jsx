import { highlightMatch } from "../../utils/highlightMatch";
import TaskItem from "./TaskItem";

export default function ServiceCard({ service, searchQuery, onSelect }) {
    const tasks = service.filteredTasks ?? [];

    return (
        <div className="service-card clickable" onClick={() => onSelect({ type: "service", data: service })}>
            <div className="service-header">
                <div className="service-title">
                    {highlightMatch(service.serviceName, searchQuery)}
                </div>
                <div className="service-info">
                    <strong>Тип:</strong> {service.serviceType?.name ?? "—"}
                </div>
            </div>

            <div className="tasks-list">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            searchQuery={searchQuery}
                            onSelect={onSelect}
                        />
                    ))
                ) : (
                    <div className="no-tasks">Немає завдань</div>
                )}
            </div>
        </div>
    );
}
