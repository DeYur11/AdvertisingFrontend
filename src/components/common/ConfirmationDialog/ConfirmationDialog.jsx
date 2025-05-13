import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import "./ConfirmationDialog.css";

export default function ConfirmationDialog({
                                               isOpen,
                                               onClose,
                                               onConfirm,
                                               title = "Підтвердження дії",
                                               message = "Ви впевнені, що хочете продовжити?",
                                               confirmText = "Підтвердити",
                                               cancelText = "Скасувати",
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
                        onClick={(e) => {
                            onConfirm(e);
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