import React from 'react';
import Button from '../../../../components/common/Button/Button';

export default function ClientsTable({ clients, onEdit, onDelete }) {
    if (!clients || clients.length === 0) {
        return (
            <div className="empty-message">
                Клієнти відсутні. Натисніть кнопку "Додати клієнта", щоб створити новий запис.
            </div>
        );
    }

    return (
        <table className="admin-table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Ім'я</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Дії</th>
            </tr>
            </thead>
            <tbody>
            {clients.map((client) => (
                <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>{client.name}</td>
                    <td>{client.email || "—"}</td>
                    <td>{client.phoneNumber || "—"}</td>
                    <td className="actions-cell">
                        <Button
                            variant="outline"
                            size="small"
                            icon="✏️"
                            className="action-button"
                            onClick={() => onEdit(client)}
                        >
                            Редагувати
                        </Button>
                        <Button
                            variant="danger"
                            size="small"
                            icon="🗑️"
                            className="action-button"
                            onClick={() => onDelete(client)}
                        >
                            Видалити
                        </Button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}