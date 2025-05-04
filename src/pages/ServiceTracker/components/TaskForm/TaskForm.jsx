// src/pages/ServiceTracker/components/TaskForm/TaskForm.jsx
import { useState } from "react";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import { getWorkerNameById } from "../../utils/serviceUtils";
import "./TaskForm.css";

export default function TaskForm({
                                     isOpen,
                                     onClose,
                                     onSave,
                                     task = null,
                                     workers = [],
                                     editIndex = -1
                                 }) {
    const [formData, setFormData] = useState({
        name: task?.name || "",
        description: task?.description || "",
        deadline: task?.deadline || new Date().toISOString().split("T")[0],
        assignedWorkerId: task?.assignedWorkerId || "",
        priority: task?.priority || "5",
        value: task?.value || ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, editIndex);
    };

    const isFormValid = formData.name && formData.deadline && formData.assignedWorkerId;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editIndex >= 0 ? "Edit Task" : "Add Task"}
            size="medium"
        >
            <form className="task-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Task Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter task name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter task description"
                        rows="3"
                    />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Deadline *</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Assign To *</label>
                        <select
                            name="assignedWorkerId"
                            value={formData.assignedWorkerId}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="">Select worker</option>
                            {workers.map(worker => (
                                <option key={worker.id} value={worker.id}>
                                    {worker.name} {worker.surname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Priority (1-10)</label>
                        <input
                            type="number"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="form-control"
                            min="1"
                            max="10"
                            placeholder="5"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Value</label>
                        <input
                            type="number"
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            className="form-control"
                            step="0.01"
                            placeholder="Enter value..."
                        />
                    </div>
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
                        disabled={!isFormValid}
                    >
                        {editIndex >= 0 ? "Save Changes" : "Add Task"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}