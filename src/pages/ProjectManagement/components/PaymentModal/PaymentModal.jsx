import { useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import DatePicker from "../../../../components/common/DatePicker/DatePicker";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PaymentModal.css";

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
                                         registrationDate,   // новий проп — дата реєстрації проекту, рядок YYYY-MM-DD
                                         purposes = [],
                                         editMode,
                                         onSave
                                     }) {
    const defaultForm = {
        paymentSum: "",
        paymentDate: null,
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
                paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
                paymentPurposeId: payment.paymentPurpose?.id || "",
                transactionNumber: payment.transactionNumber || ""
            });
        } else {
            setForm(defaultForm);
        }
        setErrors({});
    }, [editMode, payment, isOpen]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleDateChange = date => {
        setForm(prev => ({ ...prev, paymentDate: date }));
        if (errors.paymentDate) {
            setErrors(prev => ({ ...prev, paymentDate: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.paymentSum || isNaN(parseFloat(form.paymentSum))) {
            newErrors.paymentSum = "Потрібна коректна сума";
        }
        if (!form.paymentDate || !(form.paymentDate instanceof Date)) {
            newErrors.paymentDate = "Потрібна дата платежу";
        }
        if (!form.paymentPurposeId) {
            newErrors.paymentPurposeId = "Потрібне призначення платежу";
        }
        if (!form.transactionNumber?.trim()) {
            newErrors.transactionNumber = "Потрібен номер транзакції";
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            Object.values(newErrors).forEach(msg => toast.error(msg));
            return false;
        }
        return true;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) return;

        const input = {
            paymentSum: parseFloat(form.paymentSum),
            paymentDate: form.paymentDate.toISOString().split("T")[0],
            paymentPurposeId: parseInt(form.paymentPurposeId, 10),
            transactionNumber: form.transactionNumber.trim()
        };

        try {
            if (editMode) {
                await updatePayment({ variables: { id: payment.id, input } });
                toast.success("Платіж оновлено");
            } else {
                await createPayment({
                    variables: {
                        input: { ...input, projectId: parseInt(projectId, 10) }
                    }
                });
            }
            onSave();
        } catch (err) {
            console.error(err);
            toast.error("Помилка: " + err.message);
            setErrors({ submit: err.message });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editMode ? "Редагувати платіж" : "Додати платіж"}
            size="small"
        >
            <form className="payment-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="paymentSum">Сума*</label>
                    <input
                        type="number"
                        step="0.01"
                        id="paymentSum"
                        name="paymentSum"
                        value={form.paymentSum}
                        onChange={handleChange}
                        className={`form-control ${errors.paymentSum ? "is-invalid" : ""}`}
                        placeholder="наприклад, 1200.00"
                    />
                    {errors.paymentSum && (
                        <div className="invalid-feedback">{errors.paymentSum}</div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="paymentDate">Дата платежу*</label>
                    <DatePicker
                        selected={form.paymentDate}
                        onChange={handleDateChange}
                        placeholderText="Оберіть дату..."
                        className={errors.paymentDate ? "is-invalid" : ""}
                        minDate={registrationDate ? new Date(registrationDate) : null}
                    />
                    {errors.paymentDate && (
                        <div className="invalid-feedback">{errors.paymentDate}</div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="paymentPurposeId">Призначення*</label>
                    <select
                        id="paymentPurposeId"
                        name="paymentPurposeId"
                        value={form.paymentPurposeId}
                        onChange={handleChange}
                        className={`form-control ${
                            errors.paymentPurposeId ? "is-invalid" : ""
                        }`}
                    >
                        <option value="">Оберіть призначення</option>
                        {purposes.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    {errors.paymentPurposeId && (
                        <div className="invalid-feedback">{errors.paymentPurposeId}</div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="transactionNumber">Номер транзакції*</label>
                    <input
                        type="text"
                        id="transactionNumber"
                        name="transactionNumber"
                        value={form.transactionNumber}
                        onChange={handleChange}
                        className={`form-control ${
                            errors.transactionNumber ? "is-invalid" : ""
                        }`}
                        placeholder="наприклад, TXN-2024-001"
                    />
                    {errors.transactionNumber && (
                        <div className="invalid-feedback">
                            {errors.transactionNumber}
                        </div>
                    )}
                </div>

                {errors.submit && (
                    <div className="submit-error-message">Помилка: {errors.submit}</div>
                )}

                <div className="form-actions">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Скасувати
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={creating || updating}
                    >
                        {creating || updating
                            ? editMode
                                ? "Оновлюється..."
                                : "Створюється..."
                            : editMode
                                ? "Оновити платіж"
                                : "Створити платіж"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
