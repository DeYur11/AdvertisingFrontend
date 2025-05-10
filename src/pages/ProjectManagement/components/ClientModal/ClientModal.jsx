import { useState, useEffect } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import "./ClientModal.css";

// GraphQL-запити та мутації
const CREATE_CLIENT = gql`
    mutation CreateClient($input: CreateClientInput!) {
        createClient(input: $input) {
            id
            name
            phoneNumber
            email
        }
    }
`;

const UPDATE_CLIENT = gql`
    mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
        updateClient(id: $id, input: $input) {
            id
            name
            phoneNumber
            email
        }
    }
`;

const GET_CLIENT_BY_ID = gql`
    query GetClient($id: ID!) {
        client(id: $id) {
            id
            name
            email
            phoneNumber
        }
    }
`;

export default function ClientModal({ client, editMode, onSave, onCancel }) {
    const defaultForm = {
        name: client?.prefillName || "",
        email: "",
        phoneNumber: ""
    };

    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});

    const { data: clientData, loading: clientLoading } = useQuery(GET_CLIENT_BY_ID, {
        variables: { id: client?.id },
        skip: !editMode || !client?.id,
        fetchPolicy: "network-only"
    });

    const [createClient, { loading: createLoading }] = useMutation(CREATE_CLIENT);
    const [updateClient, { loading: updateLoading }] = useMutation(UPDATE_CLIENT);

    useEffect(() => {
        if (editMode && clientData?.client) {
            const c = clientData.client;
            setForm({
                name: c.name || "",
                email: c.email || "",
                phoneNumber: c.phoneNumber || ""
            });
        } else if (!editMode && client?.prefillName) {
            setForm((prev) => ({ ...prev, name: client.prefillName }));
        }
    }, [editMode, clientData, client]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Ім’я клієнта є обов’язковим";
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Некоректна електронна адреса";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (editMode) {
                const { data } = await updateClient({
                    variables: {
                        id: client.id,
                        input: {
                            name: form.name,
                            email: form.email,
                            phoneNumber: form.phoneNumber
                        }
                    }
                });
                onSave(data.updateClient);
            } else {
                const { data } = await createClient({
                    variables: {
                        input: {
                            name: form.name,
                            email: form.email,
                            phoneNumber: form.phoneNumber
                        }
                    }
                });
                onSave(data.createClient);
            }
        } catch (error) {
            console.error("Помилка під час збереження клієнта:", error);
            setErrors({ submit: error.message });
        }
    };

    const isLoading = clientLoading || createLoading || updateLoading;

    return (
        <div className="client-modal">
            {isLoading ? (
                <div className="loading-message">Завантаження...</div>
            ) : (
                <form onSubmit={handleSubmit} className="client-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Ім’я клієнта*</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className={`form-input ${errors.name ? 'has-error' : ''}`}
                                placeholder="Введіть ім’я клієнта"
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Електронна пошта</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className={`form-input ${errors.email ? 'has-error' : ''}`}
                                placeholder="Введіть адресу електронної пошти"
                            />
                            {errors.email && <div className="error-message">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber" className="form-label">Телефон</label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Введіть номер телефону"
                            />
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="submit-error-message">
                            Помилка: {errors.submit}
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={onCancel} disabled={isLoading}>
                            Скасувати
                        </button>
                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading
                                ? (editMode ? "Оновлення..." : "Створення...")
                                : (editMode ? "Оновити клієнта" : "Створити клієнта")}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
