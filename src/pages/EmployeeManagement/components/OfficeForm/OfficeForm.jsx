// src/pages/EmployeeManagement/components/OfficeForm/OfficeForm.jsx
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

    // Initialize form data when office prop changes
    useEffect(() => {
        if (office) {
            setFormData({
                id: office.id || "",
                street: office.street || "",
                cityId: office.city?.id || ""
            });
        } else {
            // Reset form for new office
            setFormData({
                id: "",
                street: "",
                cityId: ""
            });
        }
        // Clear errors when form resets
        setErrors({});
    }, [office]);

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
        if (!formData.street.trim()) {
            newErrors.street = "Street address is required";
        }

        if (!formData.cityId) {
            newErrors.cityId = "City is required";
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

    const modalTitle = office ? "Edit Office" : "Add New Office";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="medium"
        >
            <form onSubmit={handleSubmit} className="office-form">
                <div className="form-group">
                    <label className="form-label">Street Address *</label>
                    <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className={`form-control ${errors.street ? 'has-error' : ''}`}
                        placeholder="Enter street address"
                    />
                    {errors.street && <div className="error-message">{errors.street}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">City *</label>
                    <select
                        name="cityId"
                        value={formData.cityId}
                        onChange={handleChange}
                        className={`form-control ${errors.cityId ? 'has-error' : ''}`}
                    >
                        <option value="">Select city</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>
                                {city.name}, {city.country?.name}
                            </option>
                        ))}
                    </select>
                    {errors.cityId && <div className="error-message">{errors.cityId}</div>}
                    {cities.length === 0 && (
                        <div className="help-text">
                            No cities available. Please add a city first before creating an office.
                        </div>
                    )}
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
                        disabled={cities.length === 0}
                    >
                        {office ? "Save Changes" : "Create Office"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}