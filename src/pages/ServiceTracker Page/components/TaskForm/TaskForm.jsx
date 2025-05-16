// src/pages/ServiceTracker Page/components/TaskForm/TaskForm.jsx
import React, { useState, useEffect } from "react";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import LockIcon from '@mui/icons-material/Lock';
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
    locked: "Проект закінчився більше 30 днів тому. Модифікації заблоковано."
};

export default function TaskForm({
                                     isOpen,
                                     onClose,
                                     onSave,
                                     task = null,
                                     workers = [],
                                     statuses = [],
                                     isLocked = false  // New prop to handle locked projects
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

    const fibonacciValues = [
        0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610
    ];

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

        // Double-check lock status before proceeding
        if (isLocked) {
            return;
        }

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
            {isLocked && (
                <div className="task-form-lock-notice">
                    <LockIcon className="lock-icon" />
                    <span>{uk.locked}</span>
                </div>
            )}

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
                        disabled={isLocked}
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
                        disabled={isLocked}
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
                            disabled={isLocked}
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
                            disabled={!formData.id || isLocked}
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
                            disabled={isLocked}
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
                            disabled={isLocked}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{uk.labels.value}</label>
                        <select
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            className="form-control"
                            required      // якщо значення обов’язкове
                            disabled={isLocked}
                        >
                            <option value="">{uk.placeholders.value}</option>
                            {fibonacciValues.map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <Button variant="outline" type="button" onClick={onClose}>
                        {uk.buttons.cancel}
                    </Button>
                    <Button variant="primary" type="submit" disabled={!isFormValid || isLocked}>
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}