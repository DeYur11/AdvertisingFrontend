
import "./TaskDetailsModal.css";
import ServiceDetails from "../ServiceDetails/ServiceDetails";
import TaskDetails from "../TaskDetails/TaskDetails";
import {Modal} from "@mui/material";

export default function TaskDetailsModal({ isOpen, onClose, selectedItem, activeProject, activeService }) {
    if (!selectedItem) return null;

    // Determine modal title based on selected item
    let modalTitle = "";
    if (selectedItem) {
        if (selectedItem.type === "service") {
            modalTitle = `Service: ${selectedItem.data.serviceName}`;
        } else if (selectedItem.type === "task") {
            modalTitle = `Task: ${selectedItem.data.name}`;
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="large"
            className="details-modal"
        >
            <div className="details-container">
                {/* Breadcrumb navigation */}
                {(activeProject || activeService) && (
                    <div className="details-breadcrumbs">
                        {activeProject && (
                            <span className="breadcrumb-item project">
                                <span className="breadcrumb-label">Project:</span>
                                <span className="breadcrumb-value">{activeProject.name}</span>
                            </span>
                        )}

                        {activeProject && activeService && (
                            <span className="breadcrumb-separator">›</span>
                        )}

                        {activeService && selectedItem.type === "task" && (
                            <span className="breadcrumb-item service">
                                <span className="breadcrumb-label">Service:</span>
                                <span className="breadcrumb-value">{activeService.serviceName}</span>
                            </span>
                        )}
                    </div>
                )}

                {selectedItem.type === "service" && <ServiceDetails data={selectedItem.data} />}
                {selectedItem.type === "task" && <TaskDetails data={selectedItem.data} />}
            </div>
        </Modal>
    );
}