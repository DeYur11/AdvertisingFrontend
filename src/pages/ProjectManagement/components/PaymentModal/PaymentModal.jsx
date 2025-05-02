import { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import "./PaymentModal.css";

// GraphQL mutations
const CREATE_PAYMENT = gql`
    mutation CreatePayment($input: CreatePaymentInput!) {
        createPayment(input: $input) {
            id
            transactionNumber
            paymentSum
            paymentDate
        }
    }
`;

const UPDATE_PAYMENT = gql`
    mutation UpdatePayment($id: ID!, $input: UpdatePaymentInput!) {
        updatePayment(id: $id, input: $input) {
            id
            transactionNumber
            paymentSum
            paymentDate
        }
    }
`;

export default function PaymentModal({
                                         payment,
                                         projectId,
                                         purposes,
                                         editMode,
                                         onSave,
                                         onCancel
                                     }) {
    // Default form values
    const defaultForm = {
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        purposeId: ""
    };

    // Form state
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});

    // Mutations
    const [createPayment, { loading: createLoading }] = useMutation(CREATE_PAYMENT);
    const [updatePayment, { loading: updateLoading }] = useMutation(UPDATE_PAYMENT);

    // Set form values if in edit mode
    useEffect(() => {
        if (editMode && payment) {
            setForm({
                amount: payment.amount || "",
                date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : "",
                description: payment.description || "",
                purposeId: payment.purpose?.id || ""
            });
        }
    }, [editMode, payment]);

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

        if (!form.amount) {
            newErrors.amount = "Payment amount is required";
        } else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
            newErrors.amount = "Amount must be a positive number";
        }

        if (!form.date) {
            newErrors.date = "Payment date is required";
        }

        if (!form.purposeId) {
            newErrors.purposeId = "Payment purpose is required";
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
                await updatePayment({
                    variables: {
                        id: payment.id,
                        input: {
                            amount: parseFloat(form.amount),
                            date: form.date,
                            description: form.description,
                            purposeId: parseInt(form.purposeId)
                        }
                    }
                });
            } else {
                await createPayment({
                    variables: {
                        input: {
                            amount: parseFloat(form.amount),
                            date: form.date,
                            description: form.description,
                            purposeId: parseInt(form.purposeId),
                            projectId: parseInt(projectId)
                        }
                    }
                });
            }

            onSave();
        } catch (error) {
            console.error("Error saving payment:", error);
            setErrors({ submit: error.message });
        }
    };

    // Loading state
    const isLoading = createLoading || updateLoading;

    return (
        <div className="payment-modal">
            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-grid">
                    {/* Amount */}
                    <div className="form-group">
                        <label htmlFor="amount" className="form-label">Amount*</label>
                        <div className="input-with-prefix">
                            <span className="input-prefix">$</span>
                            <input
                                type="text"
                                id="amount"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                className={`form-input ${errors.amount ? 'has-error' : ''}`}
                                placeholder="Enter payment amount"
                            />
                        </div>
                        {errors.amount && <div className="error-message">{errors.amount}</div>}
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label htmlFor="date" className="form-label">Date*</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className={`form-input ${errors.date ? 'has-error' : ''}`}
                        />
                        {errors.date && <div className="error-message">{errors.date}</div>}
                    </div>

                    {/* Purpose */}
                    <div className="form-group">
                        <label htmlFor="purposeId" className="form-label">Purpose*</label>
                        <select
                            id="purposeId"
                            name="purposeId"
                            value={form.purposeId}
                            onChange={handleChange}
                            className={`form-select ${errors.purposeId ? 'has-error' : ''}`}
                        >
                            <option value="">Select Purpose</option>
                            {purposes.map(purpose => (
                                <option key={purpose.id} value={purpose.id}>
                                    {purpose.name}
                                </option>
                            ))}
                        </select>
                        {errors.purposeId && <div className="error-message">{errors.purposeId}</div>}
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
                            placeholder="Enter payment description"
                            rows="3"
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
                            : (editMode ? "Update Payment" : "Create Payment")
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}