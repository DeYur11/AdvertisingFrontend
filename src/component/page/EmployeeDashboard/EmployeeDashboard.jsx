import { useState } from "react";
import { useSelector } from "react-redux";
import EmployeeTasks from "../../EmployeeTasks/EmployeeTasks";
import Sidebar from "../../EmployeeTasks/Sidebar";
import "./EmployeeDashboard.css";

export default function EmployeeDashboard() {
    const [selectedItem, setSelectedItem] = useState(null);

    const user = useSelector(state => state.user);

    if (user.mainRole !== "Worker") {
        return <div className="access-denied">Access Denied: This page is only for Workers.</div>;
    }

    function handleSelect(item) {
        if (item.type !== "project") {
            setSelectedItem(item);
        }
    }

    function handleCloseSidebar() {
        setSelectedItem(null);
    }

    return (
        <div className={`employee-dashboard ${selectedItem ? "sidebar-open" : ""}`}>
            <div className="employee-tasks-wrapper">
                <div className="employee-tasks-container">
                    <h2>Welcome, {user.name} {user.surname}</h2>
                    <h3>Your Tasks:</h3>

                    <EmployeeTasks onSelect={handleSelect} />
                </div>
            </div>

            <Sidebar selectedItem={selectedItem} onClose={handleCloseSidebar} />
        </div>
    );
}
