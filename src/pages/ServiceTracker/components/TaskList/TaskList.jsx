// src/pages/ServiceTracker/components/TaskList/TaskList.jsx
import Button from "../../../../components/common/Button/Button";
import TaskItem from "../TaskItem/TaskItem";
import "./TaskList.css";

export default function TaskList({ tasks, onEdit, onRemove, onAddNewTask }) {
    return (
        <div className="tasks-section">
            <div className="section-header">
                <h3 className="section-title">Tasks</h3>
                <Button
                    variant="primary"
                    size="small"
                    type="button"
                    onClick={onAddNewTask}
                >
                    + Add Task
                </Button>
            </div>

            {tasks.length === 0 ? (
                <div className="no-tasks-message">
                    No tasks added yet. Click the "Add Task" button to create tasks for this service implementation.
                </div>
            ) : (
                <div className="tasks-list">
                    {tasks.map((task, index) => (
                        <TaskItem
                            key={index}
                            task={task}
                            index={index}
                            onEdit={onEdit}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}