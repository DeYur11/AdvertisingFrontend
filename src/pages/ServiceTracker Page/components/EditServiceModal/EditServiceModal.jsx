// src/pages/ServiceTracker Page/components/EditServiceModal/EditServiceModal.jsx
import { useState } from "react";
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
                                             serviceStatuses = []
                                         }) {
    const [formData, setFormData] = useState({
        startDate: serviceInProgress?.startDate || "",
        endDate: serviceInProgress?.endDate || "",
        cost: serviceInProgress?.cost || "",
        statusId: serviceInProgress?.status?.id || ""
    });

    const [updateServiceInProgress] = useMutation(UPDATE_SERVICE_IN_PROGRESS);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            <form onSubmit={handleSubmit} className="edit-service-form">

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
                    />
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
                        disabled={!formData.startDate}
                    >
                        Зберегти зміни
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
