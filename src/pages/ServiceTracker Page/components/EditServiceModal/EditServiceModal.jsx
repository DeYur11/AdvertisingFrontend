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

            toast.success("Service implementation updated successfully!");
            onSave();
        } catch (error) {
            console.error("Error updating service implementation:", error);
            toast.error(error?.message || "Failed to update service implementation. Please try again.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Service Implementation"
            size="medium"
        >
            <form onSubmit={handleSubmit} className="edit-service-form">
                <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Cost</label>
                    <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        className="form-control"
                        step="0.01"
                        placeholder="Enter cost..."
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                        name="statusId"
                        value={formData.statusId}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Select status</option>
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
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!formData.startDate}
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}