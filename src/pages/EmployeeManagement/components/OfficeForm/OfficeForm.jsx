import { useState, useEffect } from "react";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import "./OfficeForm.css";

export default function OfficeForm({
                                       isOpen,
                                       onClose,
                                       onSave,
                                       office = null,
                                       cities = []
                                   }) {
    const [formData, setFormData] = useState({
        id: "",
        street: "",
        cityId: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (office) {
            setFormData({
                id: office.id || "",
                street: office.street || "",
                cityId: office.city?.id || ""
            });
        } else {
            setFormData({
                id: "",
                street: "",
                cityId: ""
            });
        }
        setErrors({});
    }, [office]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.street.trim()) {
            newErrors.street = "Вулиця є обов’язковою";
        }

        if (!formData.cityId) {
            newErrors.cityId = "Місто є обов’язковим";
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

    const modalTitle = office ? "Редагування офісу" : "Додавання нового офісу";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="medium"
        >
            <form onSubmit={handleSubmit} className="office-form">
                <div className="form-group">
                    <label className="form-label">Вулиця *</label>
                    <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className={`form-control ${errors.street ? 'has-error' : ''}`}
                        placeholder="Введіть адресу вулиці"
                    />
                    {errors.street && <div className="error-message">{errors.street}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">Місто *</label>
                    <select
                        name="cityId"
                        value={formData.cityId}
                        onChange={handleChange}
                        className={`form-control ${errors.cityId ? 'has-error' : ''}`}
                    >
                        <option value="">Оберіть місто</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>
                                {city.name}, {city.country?.name}
                            </option>
                        ))}
                    </select>
                    {errors.cityId && <div className="error-message">{errors.cityId}</div>}
                    {cities.length === 0 && (
                        <div className="help-text">
                            Міста відсутні. Спочатку додайте місто, щоб створити офіс.
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
                        disabled={cities.length === 0}
                    >
                        {office ? "Зберегти зміни" : "Створити офіс"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
