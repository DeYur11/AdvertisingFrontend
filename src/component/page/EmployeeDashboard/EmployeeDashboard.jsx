import { useSelector } from "react-redux";
import "./EmployeeDashboard.css";
import EmployeeTasks from "../../EmployeeTasks/EmployeeTasks";

export default function EmployeeDashboard() {
    const user = useSelector(state => state.user);

    if (user.mainRole !== "Worker") {
        return <div className="access-denied">Access Denied: This page is only for Workers.</div>;
    }

    return (
        <div className="employee-dashboard">
            <h2>Welcome, {user.name} {user.surname}</h2>
            <h3>Your Tasks:</h3>
            <EmployeeTasks></EmployeeTasks>
        </div>
    );
}
