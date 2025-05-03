import { useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";

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
                                         isOpen,
                                         onClose,
                                         payment,
                                         projectId,
                                         purposes = [],
                                         editMode,
                                         onSave
                                     }) {
    const defaultForm = {
        paymentSum: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentPurposeId: "",
        transactionNumber: ""
    };

    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});

    const [createPayment, { loading: creating }] = useMutation(CREATE_PAYMENT);
    const [updatePayment, { loading: updating }] = useMutation(UPDATE_PAYMENT);

    useEffect(() => {
        if (editMode && payment) {
            setForm({
                paymentSum: payment.paymentSum?.toString() || "",
                paymentDate: payment.paymentDate || "",
                paymentPurposeId: payment.paymentPurpose?.id || "",
                transactionNumber: payment.transactionNumber || ""
            });
        } else {
            setForm(defaultForm);
        }
    }, [editMode, payment, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.paymentSum || isNaN(parseFloat(form.paymentSum))) {
            newErrors.paymentSum = "Valid amount is required";
        }
        if (!form.paymentDate) {
            newErrors.paymentDate = "Date is required";
        }
        if (!form.paymentPurposeId) {
            newErrors.paymentPurposeId = "Purpose is required";
        }
        if (!form.transactionNumber?.trim()) {
            newErrors.transactionNumber = "Transaction number is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const input = {
            paymentSum: parseFloat(form.paymentSum),
            paymentDate: form.paymentDate,
            paymentPurposeId: parseInt(form.paymentPurposeId),
            transactionNumber: form.transactionNumber.trim()
        };

        try {
            if (editMode) {
                await updatePayment({
                    variables: {
                        id: payment.id,
                        input
                    }
                });
            } else {
                await createPayment({
                    variables: {
                        input: {
                            ...input,
                            projectId: parseInt(projectId)
                        }
                    }
                });
            }
            onSave();
        } catch (err) {
            console.error(err);
            setErrors({ submit: err.message });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editMode ? "Edit Payment" : "Add Payment"}
            size="small"
        >
            <form className="payment-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="paymentSum">Amount*</label>
                    <input
                        type="number"
                        step="0.01"
                        id="paymentSum"
                        name="paymentSum"
                        value={form.paymentSum}
                        onChange={handleChange}
                        className={errors.paymentSum ? "has-error" : ""}
                        placeholder="e.g. 1200.00"
                    />
                    {errors.paymentSum && <div className="error-message">{errors.paymentSum}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="paymentDate">Payment Date*</label>
                    <input
                        type="date"
                        id="paymentDate"
                        name="paymentDate"
                        value={form.paymentDate}
                        onChange={handleChange}
                        className={errors.paymentDate ? "has-error" : ""}
                    />
                    {errors.paymentDate && <div className="error-message">{errors.paymentDate}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="paymentPurposeId">Purpose*</label>
                    <select
                        id="paymentPurposeId"
                        name="paymentPurposeId"
                        value={form.paymentPurposeId}
                        onChange={handleChange}
                        className={errors.paymentPurposeId ? "has-error" : ""}
                    >
                        <option value="">Select purpose</option>
                        {purposes.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    {errors.paymentPurposeId && <div className="error-message">{errors.paymentPurposeId}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="transactionNumber">Transaction Number*</label>
                    <input
                        type="text"
                        id="transactionNumber"
                        name="transactionNumber"
                        value={form.transactionNumber}
                        onChange={handleChange}
                        className={errors.transactionNumber ? "has-error" : ""}
                        placeholder="e.g. TXN-2024-001"
                    />
                    {errors.transactionNumber && <div className="error-message">{errors.transactionNumber}</div>}
                </div>

                {errors.submit && (
                    <div className="submit-error-message">Error: {errors.submit}</div>
                )}

                <div className="form-actions">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={creating || updating}>
                        {creating || updating
                            ? (editMode ? "Updating..." : "Creating...")
                            : (editMode ? "Update Payment" : "Create Payment")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
