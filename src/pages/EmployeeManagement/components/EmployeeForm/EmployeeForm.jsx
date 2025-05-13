// src/pages/EmployeeManagement/components/EmployeeForm/EmployeeForm.jsx
import { useState, useEffect } from "react";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import "./EmployeeForm.css";

export default function EmployeeForm({
                                         isOpen,
                                         onClose,
                                         onSave,
                                         employee = null,
                                         positions = [],
                                         offices = []
                                     }) {
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        surname: "",
        email: "",
        phoneNumber: "",
        positionId: "",
        officeId: "",
        isReviewer: false
    });

    const [errors, setErrors] = useState({});

    // Initialize form data when employee prop changes
    useEffect(() => {
        if (employee) {
            setFormData({
                id: employee.id || "",
                name: employee.name || "",
                surname: employee.surname || "",
                email: employee.email || "",
                phoneNumber: employee.phoneNumber || "",
                positionId: employee.position?.id || "",
                officeId: employee.office?.id || "",
                isReviewer: employee.isReviewer || false
            });
        } else {
            // Reset form for new employee
            setFormData({
                id: "",
                name: "",
                surname: "",
                email: "",
                phoneNumber: "",
                positionId: "",
                officeId: "",
                isReviewer: false
            });
        }
        // Clear errors when form resets
        setErrors({});
    }, [employee]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.surname.trim()) newErrors.surname = "Surname is required";

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Phone validation - optional but must be valid if provided
        if (formData.phoneNumber && !/^[+\d\s()-]{7,20}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Please enter a valid phone number";
        }

        // Required selections
        if (!formData.positionId) newErrors.positionId = "Position is required";
        if (!formData.officeId) newErrors.officeId = "Office is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
        }
    };

    const modalTitle = employee ? "Edit Employee" : "Add New Employee";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="large"
        >
            <form onSubmit={handleSubmit} className="employee-form">
                <div className="form-section">
                    <h3 className="form-section-title">Особиста інформація</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Ім’я *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`form-control ${errors.name ? 'has-error' : ''}`}
                                placeholder="Введіть ім’я"
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Прізвище *</label>
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                className={`form-control ${errors.surname ? 'has-error' : ''}`}
                                placeholder="Введіть прізвище"
                            />
                            {errors.surname && <div className="error-message">{errors.surname}</div>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="form-section-title">Контактна інформація</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Електронна пошта *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`form-control ${errors.email ? 'has-error' : ''}`}
                                placeholder="Введіть адресу ел. пошти"
                            />
                            {errors.email && <div className="error-message">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Номер телефону</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={`form-control ${errors.phoneNumber ? 'has-error' : ''}`}
                                placeholder="Введіть номер телефону"
                            />
                            {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="form-section-title">Інформація про роботу</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Посада *</label>
                            <select
                                name="positionId"
                                value={formData.positionId}
                                onChange={handleChange}
                                className={`form-control ${errors.positionId ? 'has-error' : ''}`}
                            >
                                <option value="">Оберіть посаду</option>
                                {positions.map(position => (
                                    <option key={position.id} value={position.id}>
                                        {position.name}
                                    </option>
                                ))}
                            </select>
                            {errors.positionId && <div className="error-message">{errors.positionId}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Офіс *</label>
                            <select
                                name="officeId"
                                value={formData.officeId}
                                onChange={handleChange}
                                className={`form-control ${errors.officeId ? 'has-error' : ''}`}
                            >
                                <option value="">Оберіть офіс</option>
                                {offices.map(office => (
                                    <option key={office.id} value={office.id}>
                                        {office.city?.name} - {office.street} ({office.city?.country?.name})
                                    </option>
                                ))}
                            </select>
                            {errors.officeId && <div className="error-message">{errors.officeId}</div>}
                        </div>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isReviewer"
                                checked={formData.isReviewer}
                                onChange={handleChange}
                            />
                            <span>Призначити рецензентом</span>
                        </label>
                        <div className="checkbox-help">Рецензенти можуть перевіряти та схвалювати матеріали в системі.</div>
                    </div>
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
                    >
                        {employee ? "Зберегти зміни" : "Створити працівника"}
                    </Button>
                </div>
            </form>
        </Modal>
    );

}