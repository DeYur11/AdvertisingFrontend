import { useSelector } from "react-redux";
import TaskList from "../../features/tasks/components/TaskList";
import Card from "../../components/common/Card/Card";
import "./Dashboard.css";

export default function Dashboard() {
    const user = useSelector(state => state.user);

    if (user.mainRole !== "Worker") {
        return (
            <div className="dashboard-container">
                <Card className="access-denied">
                    <div className="access-denied-icon">⚠️</div>
                    <h2>Access Denied</h2>
                    <p>This page is only accessible to Workers.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="user-welcome">
                    <h2>Welcome, {user.name} {user.surname}</h2>
                    {user.isReviewer && <div className="user-role">Worker + Reviewer</div>}
                </div>
                <div className="dashboard-actions">
                    {/* Future actions buttons can go here */}
                </div>
            </div>

            <div className="dashboard-content">
                <h3>Your Tasks</h3>

                <TaskList />
            </div>
        </div>
    );
}