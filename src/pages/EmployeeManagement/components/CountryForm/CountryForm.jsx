// src/pages/EmployeeManagement/components/CountryForm/CountryForm.jsx
import { useState, useEffect } from "react";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import "./CountryForm.css";

export default function CountryForm({
                                        isOpen,
                                        onClose,
                                        onSave,
                                        country = null
                                    }) {
    const [formData, setFormData] = useState({
        id: "",
        name: ""
    });

    const [errors, setErrors] = useState({});

    // Initialize form data when country prop changes
    useEffect(() => {
        if (country) {
            setFormData({
                id: country.id || "",
                name: country.name || ""
            });
        } else {
            // Reset form for new country
            setFormData({
                id: "",
                name: ""
            });
        }
        // Clear errors when form resets
        setErrors({});
    }, [country]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.name.trim()) {
            newErrors.name = "Потрібно вказати ім'я країни";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
        }
    };

    const modalTitle = country ? "Редагування країни" : "Додавання нової країни";
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="medium"
        >
            <form onSubmit={handleSubmit} className="country-form">
                <div className="form-group">
                    <label className="form-label">Назва країни *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-control ${errors.name ? 'has-error' : ''}`}
                        placeholder="Введіть назву країни"
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
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
                        {country ? "Зберегти зміни" : "Створити країну"}
                    </Button>
                </div>
            </form>
        </Modal>
    );

}