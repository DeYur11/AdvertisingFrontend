import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import "./ServiceModal.css";

// GraphQL queries and mutations
const GET_SERVICE_REFERENCE_DATA = gql`
    query GetServiceReferenceData {
        serviceTypes {
            id
            name
        }
    }
`;

const CREATE_SERVICE = gql`
    mutation CreateService($input: CreateServiceInput!) {
        createService(input: $input) {
            id
            serviceName
        }
    }
`;

const UPDATE_SERVICE = gql`
    mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
        updateService(id: $id, input: $input) {
            id
            serviceName
        }
    }
`;

const GET_SERVICE_BY_ID = gql`
    query GetService($id: ID!) {
        service(id: $id) {
            id
            serviceName
            description
            estimateCost
            duration
            serviceType {
                id
            }
        }
    }
`;

export default function ServiceModal({
                                         service,
                                         projectId,
                                         editMode,
                                         onSave,
                                         onCancel
                                     }) {
    // Default form values
    const defaultForm = {
        serviceName: "",
        description: "",
        estimateCost: "",
        duration: "",
        typeId: ""
    };

    // Form state
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});

    // Fetch reference data
    const { data: refData, loading: refLoading } = useQuery(GET_SERVICE_REFERENCE_DATA);

    // Fetch service data if in edit mode
    const { data: serviceData, loading: serviceLoading } = useQuery(GET_SERVICE_BY_ID, {
        variables: { id: service?.id },
        skip: !editMode || !service?.id,
        fetchPolicy: "network-only"
    });

    // Mutations
    const [createService, { loading: createLoading }] = useMutation(CREATE_SERVICE);
    const [updateService, { loading: updateLoading }] = useMutation(UPDATE_SERVICE);

    // Set form values if in edit mode
    useEffect(() => {
        if (editMode && serviceData?.service) {
            const s = serviceData.service;
            setForm({
                serviceName: s.serviceName || "",
                description: s.description || "",
                estimateCost: s.estimateCost || "",
                duration: s.duration || "",
                typeId: s.serviceType?.id || ""
            });
        }
    }, [editMode, serviceData]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!form.serviceName.trim()) {
            newErrors.serviceName = "Service name is required";
        }

        if (!form.typeId) {
            newErrors.typeId = "Service type is required";
        }

        if (form.estimateCost && isNaN(parseFloat(form.estimateCost))) {
            newErrors.estimateCost = "Estimated cost must be a number";
        }

        if (form.duration && isNaN(parseInt(form.duration))) {
            newErrors.duration = "Duration must be a number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (editMode) {
                await updateService({
                    variables: {
                        id: service.id,
                        input: {
                            serviceName: form.serviceName,
                            description: form.description,
                            estimateCost: form.estimateCost ? parseFloat(form.estimateCost) : null,
                            duration: form.duration ? parseInt(form.duration) : null,
                            typeId: parseInt(form.typeId)
                        }
                    }
                });
            } else {
                await createService({
                    variables: {
                        input: {
                            serviceName: form.serviceName,
                            description: form.description,
                            estimateCost: form.estimateCost ? parseFloat(form.estimateCost) : null,
                            duration: form.duration ? parseInt(form.duration) : null,
                            typeId: parseInt(form.typeId),
                            projectId: parseInt(projectId)
                        }
                    }
                });
            }

            onSave();
        } catch (error) {
            console.error("Error saving service:", error);
            setErrors({ submit: error.message });
        }
    };

    // Loading state
    const isLoading = refLoading || serviceLoading || createLoading || updateLoading;

    return (
        <div className="service-modal">
            {isLoading ? (
                <div className="loading-message">Loading...</div>
            ) : (
                <form onSubmit={handleSubmit} className="service-form">
                    <div className="form-grid">
                        {/* Service Name */}
                        <div className="form-group">
                            <label htmlFor="serviceName" className="form-label">Service Name*</label>
                            <input
                                type="text"
                                id="serviceName"
                                name="serviceName"
                                value={form.serviceName}
                                onChange={handleChange}
                                className={`form-input ${errors.serviceName ? 'has-error' : ''}`}
                                placeholder="Enter service name"
                            />
                            {errors.serviceName && <div className="error-message">{errors.serviceName}</div>}
                        </div>

                        {/* Service Type */}
                        <div className="form-group">
                            <label htmlFor="typeId" className="form-label">Service Type*</label>
                            <select
                                id="typeId"
                                name="typeId"
                                value={form.typeId}
                                onChange={handleChange}
                                className={`form-select ${errors.typeId ? 'has-error' : ''}`}
                            >
                                <option value="">Select Type</option>
                                {refData?.serviceTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            {errors.typeId && <div className="error-message">{errors.typeId}</div>}
                        </div>

                        {/* Estimated Cost */}
                        <div className="form-group">
                            <label htmlFor="estimateCost" className="form-label">Estimated Cost</label>
                            <div className="input-with-prefix">
                                <span className="input-prefix">$</span>
                                <input
                                    type="text"
                                    id="estimateCost"
                                    name="estimateCost"
                                    value={form.estimateCost}
                                    onChange={handleChange}
                                    className={`form-input ${errors.estimateCost ? 'has-error' : ''}`}
                                    placeholder="Enter estimated cost"
                                />
                            </div>
                            {errors.estimateCost && <div className="error-message">{errors.estimateCost}</div>}
                        </div>

                        {/* Duration */}
                        <div className="form-group">
                            <label htmlFor="duration" className="form-label">Duration (days)</label>
                            <input
                                type="text"
                                id="duration"
                                name="duration"
                                value={form.duration}
                                onChange={handleChange}
                                className={`form-input ${errors.duration ? 'has-error' : ''}`}
                                placeholder="Enter duration in days"
                            />
                            {errors.duration && <div className="error-message">{errors.duration}</div>}
                        </div>

                        {/* Description */}
                        <div className="form-group full-width">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Enter service description"
                                rows="4"
                            />
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="submit-error-message">
                            Error: {errors.submit}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? (editMode ? "Updating..." : "Creating...")
                                : (editMode ? "Update Service" : "Create Service")
                            }
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}