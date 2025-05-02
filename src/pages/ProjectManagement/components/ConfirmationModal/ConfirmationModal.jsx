import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import "./ConfirmationModal.css";

export default function ConfirmationModal({
                                              isOpen,
                                              onClose,
                                              onConfirm,
                                              type,
                                              name
                                          }) {
    // Get the appropriate confirmation message based on type
    const getTitle = () => {
        switch (type) {
            case "project":
                return "Delete Project";
            case "service":
                return "Delete Service";
            case "client":
                return "Delete Client";
            default:
                return "Confirm Delete";
        }
    };

    // Get the appropriate confirmation message based on type
    const getMessage = () => {
        switch (type) {
            case "project":
                return `Are you sure you want to delete the project "${name}"?`;
            case "service":
                return `Are you sure you want to delete the service "${name}"?`;
            case "client":
                return `Are you sure you want to delete the client "${name}"?`;
            default:
                return "Are you sure you want to delete this item?";
        }
    };

    // Get the appropriate warning message based on type
    const getWarning = () => {
        switch (type) {
            case "project":
                return "This will also delete all services and tasks associated with this project. This action cannot be undone.";
            case "service":
                return "This will also delete all tasks associated with this service. This action cannot be undone.";
            case "client":
                return "This will also remove this client from all associated projects. This action cannot be undone.";
            default:
                return "This action cannot be undone.";
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getTitle()}
            size="small"
        >
            <div className="confirmation-modal">
                <div className="warning-icon">⚠️</div>
                <p className="confirmation-message">{getMessage()}</p>
                <p className="warning-message">{getWarning()}</p>

                <div className="confirmation-actions">
                    <Button
                        variant="outline"
                        size="medium"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        size="medium"
                        onClick={onConfirm}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
}