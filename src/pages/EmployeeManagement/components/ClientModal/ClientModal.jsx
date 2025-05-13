// src/pages/EmployeeManagement/components/ClientModal/ClientModal.jsx
import { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import Button from "../../../../components/common/Button/Button";
import Modal from "../../../../components/common/Modal/Modal";
import "./ClientModal.css";

// GraphQL mutations
const CREATE_CLIENT = gql`
    mutation CreateClient($input: CreateClientInput!) {
        createClient(input: $input) {
            id
            name
        }
    }
`;

const UPDATE_CLIENT = gql`
    mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
        updateClient(id: $id, input: $input) {
            id
            name
        }
    }
`;

export default function ClientModal({
                                        client = {},
                                        editMode = false,
                                        onSave,
                                        onClose
                                    }) {
    // Default form state
    const [form, setForm] = useState({
        name: "",
        email: "",
        phoneNumber: ""
    });

    // Form validation
    const [errors, setErrors] = useState({});

    // Mutations
    const [createClient, { loading: createLoading }] = useMutation(CREATE_CLIENT);
    const [updateClient, { loading: updateLoading }] = useMutation(UPDATE_CLIENT);

    // Set form values when in edit mode
    useEffect(() => {
        if (editMode && client) {
            setForm({
                name: client.name || "",
                email: client.email || "",
                phoneNumber: client.phoneNumber || ""
            });
        } else if (client?.prefillName) {
            // If there's a prefilled name (from another component)
            setForm(prev => ({
                ...prev,
                name: client.prefillName
            }));
        }
    }, [editMode, client]);

    // Handle input change
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

        if (!form.name.trim()) {
            newErrors.name = "Назва клієнта обов'язкова";
        }

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Неправильний формат email";
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
            const input = {
                name: form.name,
                email: form.email || null,
                phoneNumber: form.phoneNumber || null
            };

            let result;

            if (editMode) {
                result = await updateClient({
                    variables: {
                        id: client.id,
                        input
                    }
                });

                if (result?.data?.updateClient) {
                    onSave(result.data.updateClient);
                }
            } else {
                result = await createClient({
                    variables: { input }
                });

                if (result?.data?.createClient) {
                    onSave(result.data.createClient);
                }
            }
        } catch (error) {
            console.error("Error saving client:", error);
            setErrors(prev => ({ ...prev, submit: error.message }));
        }
    };

    const isLoading = createLoading || updateLoading;
    const title = editMode ? "Редагувати клієнта" : "Додати нового клієнта";

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={title}
            size="medium"
        >
            <div className="client-modal-content">
                {isLoading ? (
                    <div className="loading-message">Завантаження...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="client-form">
                        <div className="form-grid">
                            {/* Client Name */}
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Назва клієнта*</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.name ? 'has-error' : ''}`}
                                    placeholder="Введіть назву клієнта"
                                />
                                {errors.name && <div className="error-message">{errors.name}</div>}
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'has-error' : ''}`}
                                    placeholder="email@example.com"
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>

                            {/* Phone Number */}
                            <div className="form-group">
                                <label htmlFor="phoneNumber" className="form-label">Телефон</label>
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="+380123456789"
                                />
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="submit-error-message">{errors.submit}</div>
                        )}

                        <div className="form-actions">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Скасувати
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? (editMode ? "Оновлення..." : "Створення...")
                                    : (editMode ? "Оновити" : "Створити")
                                }
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}