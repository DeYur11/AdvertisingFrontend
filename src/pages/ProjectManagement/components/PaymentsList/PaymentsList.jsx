import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import "./PaymentsList.css";

export default function PaymentsList({
                                         project,
                                         payments,
                                         loading,
                                         error,
                                         onAddPayment,    // функція(project)
                                         onEditPayment,   // функція(payment, project)
                                         onDeletePayment  // функція(payment)
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

    const formatDate = (date) => date ? new Date(date).toLocaleDateString("uk-UA") : "—";
    const sortedPayments = [...payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    const isPaymentOlderThan90Days = (paymentDate) => {
        if (!paymentDate) return false;

        const paymentTime = new Date(paymentDate).getTime();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        return paymentTime < ninetyDaysAgo.getTime();
    };

    return (
        <div className="payments-container">
            <div className="payments-header">
                <div className="header-title">
                    <h1>Платежі проєкту</h1>
                    <p className="project-name">{project?.name}</p>
                </div>
                <div className="header-actions">
                    <Button
                        variant="primary"
                        size="medium"
                        icon="💰"
                        onClick={() => onAddPayment?.(project)}
                    >
                        Додати платіж
                    </Button>
                </div>
            </div>

            <div className="finance-summary small">
                <Card className="summary-card income">
                    <div className="summary-icon">💵</div>
                    <div className="summary-content">
                        <div className="summary-label">Надходження</div>
                        <div className="summary-value">${totals.income}</div>
                    </div>
                </Card>
                <Card className="summary-card expenses">
                    <div className="summary-icon">💸</div>
                    <div className="summary-content">
                        <div className="summary-label">Витрати</div>
                        <div className="summary-value">${totals.expenses}</div>
                    </div>
                </Card>
                <Card className="summary-card balance">
                    <div className="summary-icon">📊</div>
                    <div className="summary-content">
                        <div className="summary-label">Баланс</div>
                        <div className={`summary-value ${parseFloat(totals.balance) < 0 ? 'negative' : ''}`}>
                            ${totals.balance}
                        </div>
                    </div>
                </Card>
                <Card className="summary-card balance">
                    <div className="summary-icon">📈</div>
                    <div className="summary-content">
                        <div className="summary-label">Чистий прибуток</div>
                        <div className={`summary-value ${netProfit < 0 ? 'negative' : ''}`}>
                            ${netProfit}
                        </div>
                    </div>
                </Card>
            </div>

            {loading ? (
                <div className="loading-message">Завантаження платежів...</div>
            ) : error ? (
                <div className="error-message">Помилка при завантаженні: {error.message}</div>
            ) : (
                <div className="payments-list">
                    <div className="payments-header-row" style={{ gridTemplateColumns: '100px 120px 1fr 120px 120px 160px' }}>
                        <div className="payment-date-col">Дата</div>
                        <div className="payment-purpose-col">Призначення</div>
                        <div className="payment-description-col">Опис</div>
                        <div className="payment-amount-col">Сума</div>
                        <div className="payment-delta-col">Δ до вартості</div>
                        <div className="payment-actions-col">Дії</div>
                    </div>

                    {sortedPayments.length > 0 ? (
                        sortedPayments.map(payment => {
                            const isOlderThan90Days = isPaymentOlderThan90Days(payment.paymentDate);

                            return (
                                <div
                                    key={payment.id}
                                    className={`payment-row ${parseFloat(payment.paymentSum) < 0 ? 'expense' : 'income'} ${isOlderThan90Days ? 'historical-payment' : ''}`}
                                    style={{ gridTemplateColumns: '100px 120px 1fr 120px 120px 160px' }}
                                    title={`Транзакція №: ${payment.transactionNumber}\nСтворено: ${formatDate(payment.createDatetime)}\nОновлено: ${formatDate(payment.updateDatetime)}${isOlderThan90Days ? '\nЦей платіж старший за 90 днів і не може бути змінений або видалений' : ''}`}
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
                                            disabled={isOlderThan90Days}
                                        >
                                            Редагувати
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="small"
                                            icon="🗑"
                                            onClick={() => onDeletePayment(payment)}
                                            className="delete-button"
                                            disabled={isOlderThan90Days}
                                        >
                                            Видалити
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <Card className="empty-state-card">
                            <div className="no-payments-message">
                                Для цього проєкту ще немає платежів. Натисніть "Додати платіж", щоб зареєструвати новий.
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
