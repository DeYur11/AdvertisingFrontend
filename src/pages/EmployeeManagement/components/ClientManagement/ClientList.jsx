// src/pages/EmployeeManagement/components/ClientManagement/ClientList.jsx
import Card from "../../../../components/common/Card/Card";
import Button from "../../../../components/common/Button/Button";
import "./ClientList.css";

export default function ClientList({
                                       clients = [],
                                       onEdit,
                                       onDelete,
                                       sortField,
                                       sortDirection,
                                       onSortChange
                                   }) {
    const handleEditClick = (e, client) => {
        e.stopPropagation();
        onEdit(client);
    };

    const handleDeleteClick = (e, client) => {
        e.stopPropagation();
        onDelete(client);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="client-list-container">
            <div className="client-list-header">
                <div
                    className={`header-cell client-name ${sortField === 'name' ? 'sorted' : ''}`}
                    onClick={() => onSortChange('name')}
                >
                    Назва
                    {sortField === 'name' && (
                        <span className="sort-indicator">{sortDirection === 'ASC' ? '↑' : '↓'}</span>
                    )}
                </div>
                <div
                    className={`header-cell client-email ${sortField === 'email' ? 'sorted' : ''}`}
                    onClick={() => onSortChange('email')}
                >
                    Email
                    {sortField === 'email' && (
                        <span className="sort-indicator">{sortDirection === 'ASC' ? '↑' : '↓'}</span>
                    )}
                </div>
                <div
                    className={`header-cell client-phone ${sortField === 'phoneNumber' ? 'sorted' : ''}`}
                    onClick={() => onSortChange('phoneNumber')}
                >
                    Телефон
                    {sortField === 'phoneNumber' && (
                        <span className="sort-indicator">{sortDirection === 'ASC' ? '↑' : '↓'}</span>
                    )}
                </div>
                <div className="header-cell client-actions">
                    Дії
                </div>
            </div>

            {clients.length === 0 ? (
                <Card className="empty-list-card">
                    <div className="empty-message">Клієнтів не знайдено. Використайте кнопку "Додати клієнта", щоб створити нового клієнта.</div>
                </Card>
            ) : (
                <div className="client-list">
                    {clients.map(client => (
                        <Card key={client.id} className="client-card">
                            <div className="client-info">
                                <div className="client-name-cell">
                                    <div className="client-name-wrapper">
                                        <span className="client-name">{client.name || "Без назви"}</span>
                                    </div>
                                </div>
                                <div className="client-email-cell">
                                    <span className="client-email">{client.email || "—"}</span>
                                </div>
                                <div className="client-phone-cell">
                                    <span className="client-phone">{client.phoneNumber || "—"}</span>
                                </div>
                                <div className="client-actions-cell">
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={(e) => handleEditClick(e, client)}
                                    >
                                        Редагувати
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="small"
                                        onClick={(e) => handleDeleteClick(e, client)}
                                    >
                                        Видалити
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}