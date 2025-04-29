import "./Sidebar.css";
import TaskDetails from "./Details/TaskDetails";
import ServiceDetails from "./Details/ServiceDetails";


export default function Sidebar({ selectedItem, onClose }) {
    if (!selectedItem || selectedItem.type === "project") return null;

    const { type, data } = selectedItem;

    return (
        <div id="taskSidebar">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h5 className="mb-0">{type === "service" ? "Деталі сервісу" : "Деталі завдання"}</h5>
                <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="p-3">
                {type === "service" && <ServiceDetails data={data} />}
                {type === "task" && <TaskDetails data={data} />}
            </div>
        </div>
    );
}
