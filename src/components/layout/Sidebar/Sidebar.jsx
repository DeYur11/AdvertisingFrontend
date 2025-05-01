import "./Sidebar.css";
import TaskDetails from "../../../features/tasks/components/details/TaskDetails/TaskDetails";
import ServiceDetails from "../../../features/tasks/components/details/ServiceDetails/ServiceDetails";

export default function Sidebar({ selectedItem, onClose }) {
    if (!selectedItem || selectedItem.type === "project") return null;

    const { type, data } = selectedItem;
    const detailType = type === "service" ? "Service" : "Task";

    return (
        <>
            <div id="sidebarBackdrop" onClick={onClose}></div>
            <div id="taskSidebar" className="sidebar">
                <div className="sidebar-header">
                    <h5 className="sidebar-title">{detailType} Details</h5>
                    <button className="close-button" onClick={onClose} aria-label="Close sidebar">
                        ✕
                    </button>
                </div>

                <div className="sidebar-content">
                    {type === "service" && <ServiceDetails data={data} />}
                    {type === "task" && <TaskDetails data={data} />}
                </div>
            </div>
        </>
    );
}