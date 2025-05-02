import { useState, useEffect } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import "./ClientModal.css";

// GraphQL queries and mutations
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

const GET_CLIENT_BY_ID = gql`
    query GetClient($id: ID!) {
        client(id: $id) {
            id
            name
            email
            phone
            address
            contactPerson
            notes
        }
    }
`;

export default function ClientModal({
                                        client,
                                        editMode,
                                        onSave,
                                        onCancel
                                    }) {
    // Default form values
    const defaultForm = {
        name: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: "",
        notes: ""
    };

    // Form state
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});

    // Fetch client data if in edit mode
    const { data: clientData, loading: clientLoading } = useQuery(GET_CLIENT_BY_ID, {
        variables: { id: client?.id },
        skip: !editMode || !client?.id,
        fetchPolicy: "network-only"
    });

    // Mutations
    const [createClient, { loading: createLoading }] = useMutation(CREATE_CLIENT);
    const [updateClient, { loading: updateLoading }] = useMutation(UPDATE_CLIENT);

    // Set form values if in edit mode
    useEffect(() => {
        if (editMode && clientData?.client) {
            const c = clientData.client;
            setForm({
                name: c.name || "",
                email: c.email || "",
                phone: c.phone || "",
                address: c.address || "",
                contactPerson: c.contactPerson || "",
                notes: c.notes || ""
            });
        }
    }, [editMode, clientData]);

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

        if (!form.name.trim()) {
            newErrors.name = "Client name is required";
        }

        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Email is invalid";
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
                await updateClient({
                    variables: {
                        id: client.id,
                        input: {
                            name: form.name,
                            email: form.email,
                            phone: form.phone,
                            address: form.address,
                            contactPerson: form.contactPerson,
                            notes: form.notes
                        }
                    }
                });
            } else {
                await createClient({
                    variables: {
                        input: {
                            name: form.name,
                            email: form.email,
                            phone: form.phone,
                            address: form.address,
                            contactPerson: form.contactPerson,
                            notes: form.notes
                        }
                    }
                });
            }

            onSave();
        } catch (error) {
            console.error("Error saving client:", error);
            setErrors({ submit: error.message });
        }
    };

    // Loading state
    const isLoading = clientLoading || createLoading || updateLoading;

    return (
        <div className="client-modal">
            {isLoading ? (
                <div className="loading-message">Loading...</div>
            ) : (
                <form onSubmit={handleSubmit} className="client-form">
                    <div className="form-grid">
                        {/* Client Name */}
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Client Name*</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className={`form-input ${errors.name ? 'has-error' : ''}`}
                                placeholder="Enter client name"
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
                                placeholder="Enter email address"
                            />
                            {errors.email && <div className="error-message">{errors.email}</div>}
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">Phone</label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter phone number"
                            />
                        </div>

                        {/* Contact Person */}
                        <div className="form-group">
                            <label htmlFor="contactPerson" className="form-label">Contact Person</label>
                            <input
                                type="text"
                                id="contactPerson"
                                name="contactPerson"
                                value={form.contactPerson}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter contact person name"
                            />
                        </div>

                        {/* Address */}
                        <div className="form-group full-width">
                            <label htmlFor="address" className="form-label">Address</label>
                            <textarea
                                id="address"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Enter client address"
                                rows="2"
                            />
                        </div>

                        {/* Notes */}
                        <div className="form-group full-width">
                            <label htmlFor="notes" className="form-label">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Enter additional notes"
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
                                : (editMode ? "Update Client" : "Create Client")
                            }
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}