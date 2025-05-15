// src/pages/ServiceTracker Page/components/EditServiceModal/EditServiceModal.jsx
import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import { UPDATE_SERVICE_IN_PROGRESS } from "../../graphql/mutations";
import "./EditServiceModal.css";
import { toast } from "react-toastify";

export default function EditServiceModal({
                                             isOpen,
                                             onClose,
                                             serviceInProgress,
                                             onSave,
                                             serviceStatuses = [],
                                             isLocked = false  // New prop to handle locked projects
                                         }) {
    const [formData, setFormData] = useState({
        startDate: serviceInProgress?.startDate || "",
        endDate: serviceInProgress?.endDate || "",
        cost: serviceInProgress?.cost || "",
        statusId: serviceInProgress?.status?.id || ""
    });

    const [updateServiceInProgress] = useMutation(UPDATE_SERVICE_IN_PROGRESS);

    // Effect to display a message if the project is locked
    useEffect(() => {
        if (isLocked && isOpen) {
            toast.warning("Цей проект заблоковано для редагування, оскільки він закінчився більше 30 днів тому.");
        }
    }, [isLocked, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Double-check lock status before proceeding
        if (isLocked) {
            toast.error("Неможливо зберегти зміни. Проект заблоковано.");
            return;
        }

        try {
            await updateServiceInProgress({
                variables: {
                    id: parseInt(serviceInProgress.id),
                    input: {
                        startDate: formData.startDate,
                        endDate: formData.endDate || null,
                        cost: formData.cost ? parseFloat(formData.cost) : null,
                        statusId: formData.statusId ? parseInt(formData.statusId) : null
                    }
                }
            });

            toast.success("Реалізацію сервісу успішно оновлено!");
            onSave();
        } catch (error) {
            console.error("Помилка під час оновлення реалізації сервісу:", error);
            toast.error(error?.message || "Не вдалося оновити реалізацію сервісу. Спробуйте ще раз.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Редагування реалізації сервісу"
            size="medium"
        >
            {isLocked && (
                <div className="modal-lock-notice">
                    Проект закінчився більше 30 днів тому. Редагування заблоковано.
                </div>
            )}

            <form onSubmit={handleSubmit} className="edit-service-form">
                <div className="form-group">
                    <label className="form-label">Дата початку</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="form-control"
                        required
                        disabled={isLocked}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Дата завершення</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="form-control"
                        disabled={isLocked}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Вартість</label>
                    <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        className="form-control"
                        step="0.01"
                        placeholder="Введіть вартість..."
                        disabled={isLocked}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Статус</label>
                    <select
                        name="statusId"
                        value={formData.statusId}
                        onChange={handleChange}
                        className="form-control"
                        disabled={isLocked}
                    >
                        <option value="">Виберіть статус</option>
                        {serviceStatuses.map(status => (
                            <option key={status.id} value={status.id}>
                                {status.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onClose}
                    >
                        Скасувати
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!formData.startDate || isLocked}
                    >
                        Зберегти зміни
                    </Button>
                </div>
            </form>
        </Modal>
    );
}