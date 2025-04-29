import { highlightMatch } from "../../utils/highlightMatch";
import "./TaskItem.css";

export default function TaskItem({ task, searchQuery, onSelect }) {
    function handleClick(event) {
        event.stopPropagation();
        onSelect({ type: "task", data: task });
    }

    const status = task.taskStatus?.name?.toLowerCase(); // Робимо статус у нижньому регістрі

    return (
        <div className="task-item clickable" onClick={handleClick}>
            <div className="task-left">
                {highlightMatch(task.name, searchQuery)}
            </div>
            <div className="task-right">
                <div className="task-status-wrapper">
    <span className={`status-badge status-${status}`}>
      {task.taskStatus?.name}
    </span>
                </div>
                <div className="task-details">
                    <div>Пріоритет: {task.priority ?? "—"}</div>
                    <div>Дедлайн: {task.deadline || "—"}</div>
                </div>
            </div>


        </div>
    );
}
