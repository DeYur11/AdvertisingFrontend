import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import "./ConfirmationDialog.css";

export default function ConfirmationDialog({
                                               isOpen,
                                               onClose,
                                               onConfirm,
                                               title = "Confirm Action",
                                               message = "Are you sure you want to proceed?",
                                               confirmText = "Confirm",
                                               cancelText = "Cancel",
                                               variant = "danger"
                                           }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="small"
        >
            <div className="confirmation-dialog">
                <div className="confirmation-icon">
                    {variant === "danger" ? "⚠️" : "❓"}
                </div>
                <p className="confirmation-message">{message}</p>

                <div className="confirmation-actions">
                    <Button
                        variant="outline"
                        size="medium"
                        onClick={onClose}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        size="medium"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}