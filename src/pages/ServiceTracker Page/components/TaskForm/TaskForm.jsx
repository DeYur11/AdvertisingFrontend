// src/pages/ServiceTrackerPage/components/TaskForm/TaskForm.jsx
import React, { useState, useEffect } from "react";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import "./TaskForm.css";

const uk = {
    modalTitleAdd: "Додати завдання",
    modalTitleEdit: "Редагувати завдання",
    labels: {
        name: "Назва завдання *",
        description: "Опис",
        deadline: "Термін *",
        status: "Статус *",
        assignTo: "Призначити виконавця *",
        priority: "Пріоритет (1–10)",
        value: "Вартість",
    },
    placeholders: {
        name: "Введіть назву завдання",
        description: "Введіть опис завдання",
        priority: "5",
        value: "Введіть вартість…",
    },
    optionDefaultStatus: "Виберіть статус",
    optionDefaultWorker: "Виберіть виконавця",
    buttons: {
        cancel: "Скасувати",
        save: "Зберегти зміни",
        add: "Додати завдання",
    },
};

export default function TaskForm({
                                     isOpen,
                                     onClose,
                                     onSave,
                                     task = null,
                                     workers = [],
                                     statuses = [],
                                 }) {
    const [formData, setFormData] = useState({
        id: task?.id || "",
        name: task?.name || "",
        description: task?.description || "",
        deadline: task?.deadline || new Date().toISOString().split("T")[0],
        assignedWorkerId: task?.assignedWorkerId || "",
        taskStatusId: task?.taskStatusId || "",
        priority: task?.priority || "5",
        value: task?.value || "",
    });

    useEffect(() => {
        if (task) {
            setFormData({
                id: task.id || "",
                name: task.name || "",
                description: task.description || "",
                deadline: task.deadline || new Date().toISOString().split("T")[0],
                assignedWorkerId: task.assignedWorkerId || "",
                taskStatusId: task.taskStatusId || "",
                priority: task.priority || "5",
                value: task.value || "",
            });
        }
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!formData.id) delete payload.taskStatusId;
        onSave(payload);
    };

    const isFormValid =
        formData.name &&
        formData.deadline &&
        formData.assignedWorkerId &&
        (formData.taskStatusId || !formData.id);

    const modalTitle = formData.id
        ? uk.modalTitleEdit
        : uk.modalTitleAdd;
    const submitLabel = formData.id
        ? uk.buttons.save
        : uk.buttons.add;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="medium">
            <form className="task-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">{uk.labels.name}</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={uk.placeholders.name}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">{uk.labels.description}</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={uk.placeholders.description}
                        rows="3"
                    />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">{uk.labels.deadline}</label>
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
                        <label className="form-label">{uk.labels.status}</label>
                        <select
                            name="taskStatusId"
                            value={formData.taskStatusId}
                            onChange={handleChange}
                            className="form-control"
                            required
                            disabled={!formData.id}
                        >
                            <option value="">{uk.optionDefaultStatus}</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{uk.labels.assignTo}</label>
                        <select
                            name="assignedWorkerId"
                            value={formData.assignedWorkerId}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="">{uk.optionDefaultWorker}</option>
                            {workers.map((worker) => (
                                <option key={worker.id} value={worker.id}>
                                    {worker.name} {worker.surname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{uk.labels.priority}</label>
                        <input
                            type="number"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="form-control"
                            min="1"
                            max="10"
                            placeholder={uk.placeholders.priority}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{uk.labels.value}</label>
                        <input
                            type="number"
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            className="form-control"
                            step="0.01"
                            placeholder={uk.placeholders.value}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <Button variant="outline" type="button" onClick={onClose}>
                        {uk.buttons.cancel}
                    </Button>
                    <Button variant="primary" type="submit" disabled={!isFormValid}>
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
