import { useSelector } from "react-redux";
import "./EmployeeDashboard.css";

export default function EmployeeDashboard() {
    const user = useSelector(state => state.user);

    // Фейкові завдання (поки що без API)
    const tasks = [
        { id: 1, title: "Design login page", status: "In Progress" },
        { id: 2, title: "Fix navigation bugs", status: "Completed" },
        { id: 3, title: "Implement review feature", status: "Pending" },
    ];

    if (user.mainRole !== "Worker") {
        return <div className="access-denied">Access Denied: This page is only for Workers.</div>;
    }

    return (
        <div className="employee-dashboard">
            <h2>Welcome, {user.name} {user.surname}</h2>
            <h3>Your Tasks:</h3>
            <div className="tasks-list">
                {tasks.map(task => (
                    <div key={task.id} className="task-item">
                        <div className="task-title">{task.title}</div>
                        <div className={`task-status status-${task.status.toLowerCase().replace(" ", "-")}`}>
                            {task.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
