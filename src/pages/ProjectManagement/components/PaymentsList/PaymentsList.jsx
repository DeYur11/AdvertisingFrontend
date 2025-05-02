import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import "./PaymentsList.css";

export default function PaymentsList({
                                         project,
                                         payments,
                                         loading,
                                         error,
                                         onBack,
                                         onAddPayment,
                                         onEditPayment,
                                         onDeletePayment
                                     }) {
    // Calculate total income and expenses
    const calculateTotals = () => {
        let income = 0;
        let expenses = 0;

        payments.forEach(payment => {
            const amount = parseFloat(payment.amount);
            if (amount > 0) {
                income += amount;
            } else {
                expenses += Math.abs(amount);
            }
        });

        return {
            income: income.toFixed(2),
            expenses: expenses.toFixed(2),
            balance: (income - expenses).toFixed(2)
        };
    };

    const totals = calculateTotals();

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    // Sort payments by date (newest first)
    const sortedPayments = [...payments].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    return (
        <div className="payments-container">
            <div className="payments-header">
                <div className="header-left">
                    <Button
                        variant="outline"
                        size="small"
                        icon="←"
                        onClick={onBack}
                        className="back-button"
                    >
                        Back to Projects
                    </Button>
                    <div className="header-title">
                        <h1>Project Payments</h1>
                        <p className="project-name">{project?.name}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <Button
                        variant="primary"
                        size="medium"
                        icon="💰"
                        onClick={onAddPayment}
                    >
                        Add Payment
                    </Button>
                </div>
            </div>

            <div className="finance-summary">
                <Card className="summary-card income">
                    <div className="summary-icon">💵</div>
                    <div className="summary-content">
                        <div className="summary-label">Income</div>
                        <div className="summary-value">${totals.income}</div>
                    </div>
                </Card>
                <Card className="summary-card expenses">
                    <div className="summary-icon">💸</div>
                    <div className="summary-content">
                        <div className="summary-label">Expenses</div>
                        <div className="summary-value">${totals.expenses}</div>
                    </div>
                </Card>
                <Card className="summary-card balance">
                    <div className="summary-icon">📊</div>
                    <div className="summary-content">
                        <div className="summary-label">Balance</div>
                        <div className={`summary-value ${parseFloat(totals.balance) < 0 ? 'negative' : ''}`}>
                            ${totals.balance}
                        </div>
                    </div>
                </Card>
                <Card className="summary-card">
                    <div className="summary-icon">⏱️</div>
                    <div className="summary-content">
                        <div className="summary-label">Duration</div>
                        <div className="summary-value">
                            {project?.startDate && project?.endDate ?
                                `${Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))} days` :
                                "—"
                            }
                        </div>
                    </div>
                </Card>
            </div>

            {loading ? (
                <div className="loading-message">Loading payments...</div>
            ) : error ? (
                <div className="error-message">Error loading payments: {error.message}</div>
            ) : (
                <div className="payments-list">
                    <div className="payments-header-row">
                        <div className="payment-date-col">Date</div>
                        <div className="payment-purpose-col">Purpose</div>
                        <div className="payment-description-col">Description</div>
                        <div className="payment-amount-col">Amount</div>
                        <div className="payment-actions-col">Actions</div>
                    </div>

                    {sortedPayments.length > 0 ? (
                        sortedPayments.map(payment => (
                            <div
                                key={payment.id}
                                className={`payment-row ${parseFloat(payment.amount) < 0 ? 'expense' : 'income'}`}
                            >
                                <div className="payment-date-col">
                                    {formatDate(payment.date)}
                                </div>

                                <div className="payment-purpose-col">
                                    <Badge
                                        variant={parseFloat(payment.amount) < 0 ? 'warning' : 'success'}
                                        size="small"
                                    >
                                        {payment.purpose?.name || "—"}
                                    </Badge>
                                </div>

                                <div className="payment-description-col">
                                    {payment.description || "—"}
                                </div>

                                <div className="payment-amount-col">
                                    <span className={parseFloat(payment.amount) < 0 ? 'negative' : 'positive'}>
                                        ${Math.abs(parseFloat(payment.amount)).toFixed(2)}
                                    </span>
                                </div>

                                <div className="payment-actions-col">
                                    <Button
                                        variant="outline"
                                        size="small"
                                        icon="✏️"
                                        onClick={() => onEditPayment(payment)}
                                        className="edit-button"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="small"
                                        icon="🗑"
                                        onClick={() => onDeletePayment(payment)}
                                        className="delete-button"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Card className="empty-state-card">
                            <div className="no-payments-message">
                                No payments found for this project. Click "Add Payment" to register a payment.
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}