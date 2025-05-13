// src/pages/EmployeeManagement/components/CityForm/CityForm.jsx
import { useState, useEffect } from "react";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import "./CityForm.css";

export default function CityForm({
                                     isOpen,
                                     onClose,
                                     onSave,
                                     city = null,
                                     countries = []
                                 }) {
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        countryId: ""
    });

    const [errors, setErrors] = useState({});

    // Initialize form data when city prop changes
    useEffect(() => {
        if (city) {
            setFormData({
                id: city.id || "",
                name: city.name || "",
                countryId: city.country?.id || ""
            });
        } else {
            // Reset form for new city
            setFormData({
                id: "",
                name: "",
                countryId: ""
            });
        }
        // Clear errors when form resets
        setErrors({});
    }, [city]);

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
            newErrors.name = "Назва міста обов'язкова";
        }

        if (!formData.countryId) {
            newErrors.countryId = "Місто обов'язкове";
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

    const modalTitle = city ? "Редагування міста" : "Додавання нового міста";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="medium"
        >
            <form onSubmit={handleSubmit} className="city-form">
                <div className="form-group">
                    <label className="form-label">Назва міста *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-control ${errors.name ? 'has-error' : ''}`}
                        placeholder="Введіть назву міста"
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">Країна *</label>
                    <select
                        name="countryId"
                        value={formData.countryId}
                        onChange={handleChange}
                        className={`form-control ${errors.countryId ? 'has-error' : ''}`}
                    >
                        <option value="">Оберіть країну</option>
                        {countries.map(country => (
                            <option key={country.id} value={country.id}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                    {errors.countryId && <div className="error-message">{errors.countryId}</div>}
                    {countries.length === 0 && (
                        <div className="help-text">
                            Немає доступних країн. Додайте країну, перш ніж створити місто.
                        </div>
                    )}
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
                        disabled={countries.length === 0}
                    >
                        {city ? "Зберегти зміни" : "Створити місто"}
                    </Button>
                </div>
            </form>
        </Modal>
    );

}