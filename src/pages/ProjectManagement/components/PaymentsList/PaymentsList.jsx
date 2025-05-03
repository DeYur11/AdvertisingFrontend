import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import "./PaymentsList.css";

export default function PaymentsList({
                                         project,
                                         payments,
                                         loading,
                                         error,
                                         onAddPayment,    // function(project)
                                         onEditPayment,   // function(payment, project)
                                         onDeletePayment  // function(payment)
                                     }) {
    const calculateTotals = () => {
        let income = 0, expenses = 0;
        payments.forEach(p => {
            const amount = parseFloat(p.paymentSum);
            if (amount > 0) income += amount;
            else expenses += Math.abs(amount);
        });
        return {
            income: income.toFixed(2),
            expenses: expenses.toFixed(2),
            balance: (income - expenses).toFixed(2)
        };
    };

    const totals = calculateTotals();
    const projectCost = parseFloat(project?.cost || 0);
    const netProfit = (parseFloat(totals.income) - parseFloat(totals.expenses) - projectCost).toFixed(2);

    const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "—";
    const sortedPayments = [...payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    return (
        <div className="payments-container">
            <div className="payments-header">
                <div className="header-title">
                    <h1>Project Payments</h1>
                    <p className="project-name">{project?.name}</p>
                </div>
                <div className="header-actions">
                    <Button
                        variant="primary"
                        size="medium"
                        icon="💰"
                        onClick={() => onAddPayment?.(project)}
                    >
                        Add Payment
                    </Button>
                </div>
            </div>

            <div className="finance-summary small">
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
                <Card className="summary-card balance">
                    <div className="summary-icon">📈</div>
                    <div className="summary-content">
                        <div className="summary-label">Net Profit</div>
                        <div className={`summary-value ${netProfit < 0 ? 'negative' : ''}`}>
                            ${netProfit}
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
                    <div className="payments-header-row" style={{ gridTemplateColumns: '100px 120px 1fr 120px 120px 160px' }}>
                        <div className="payment-date-col">Date</div>
                        <div className="payment-purpose-col">Purpose</div>
                        <div className="payment-description-col">Description</div>
                        <div className="payment-amount-col">Amount</div>
                        <div className="payment-delta-col">Δ vs Cost</div>
                        <div className="payment-actions-col">Actions</div>
                    </div>

                    {sortedPayments.length > 0 ? (
                        sortedPayments.map(payment => (
                            <div
                                key={payment.id}
                                className={`payment-row ${parseFloat(payment.paymentSum) < 0 ? 'expense' : 'income'}`}
                                style={{ gridTemplateColumns: '100px 120px 1fr 120px 120px 160px' }}
                                title={`Transaction #: ${payment.transactionNumber}\nCreated: ${formatDate(payment.createDatetime)}\nUpdated: ${formatDate(payment.updateDatetime)}`}
                            >
                                <div className="payment-date-col">{formatDate(payment.paymentDate)}</div>
                                <div className="payment-purpose-col">
                                    <Badge
                                        variant={parseFloat(payment.paymentSum) < 0 ? 'warning' : 'success'}
                                        size="small"
                                    >
                                        {payment.paymentPurpose?.name || "—"}
                                    </Badge>
                                </div>
                                <div className="payment-description-col">{payment.transactionNumber || "—"}</div>
                                <div className="payment-amount-col">
                                    <span className={parseFloat(payment.paymentSum) < 0 ? 'negative' : 'positive'}>
                                        ${Math.abs(parseFloat(payment.paymentSum)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="payment-delta-col">
                                    ${(parseFloat(payment.paymentSum) - projectCost).toFixed(2)}
                                </div>
                                <div className="payment-actions-col">
                                    <Button
                                        variant="outline"
                                        size="small"
                                        icon="✏️"
                                        onClick={() => onEditPayment?.(payment, project)}
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
