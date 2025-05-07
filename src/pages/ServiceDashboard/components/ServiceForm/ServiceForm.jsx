// src/pages/ServiceDashboard/components/ServiceForm/ServiceForm.jsx
import { useState, useEffect } from "react";
import Button from "../../../../components/common/Button/Button";
import "./ServiceForm.css";

export default function ServiceForm({
                                        service,
                                        serviceTypes,
                                        onSubmit,
                                        onCancel
                                    }) {
    const [formData, setFormData] = useState({
        serviceName: "",
        estimateCost: "",
        serviceTypeId: ""
    });

    // Load service data when editing
    useEffect(() => {
        if (service) {
            setFormData({
                serviceName: service.serviceName || "",
                estimateCost: service.estimateCost || "",
                serviceTypeId: service.serviceType?.id || ""
            });
        }
    }, [service]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const isFormValid =
        formData.serviceName.trim() !== "" &&
        formData.estimateCost !== "" &&
        formData.serviceTypeId !== "";

    return (
        <form className="service-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="serviceName" className="form-label">Service Name *</label>
                <input
                    type="text"
                    id="serviceName"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter service name"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="estimateCost" className="form-label">Estimated Cost ($) *</label>
                <input
                    type="number"
                    id="estimateCost"
                    name="estimateCost"
                    value={formData.estimateCost}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter estimated cost"
                    min="0"
                    step="0.01"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="serviceTypeId" className="form-label">Service Type *</label>
                <select
                    id="serviceTypeId"
                    name="serviceTypeId"
                    value={formData.serviceTypeId}
                    onChange={handleChange}
                    className="form-control"
                    required
                >
                    <option value="">Select service type</option>
                    {serviceTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-actions">
                <Button
                    variant="outline"
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    disabled={!isFormValid}
                >
                    {service ? "Update Service" : "Create Service"}
                </Button>
            </div>
        </form>
    );
}