// src/components/ui/NotificationSidebar.css/NotificationSidebar.css.jsx
import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import './NotificationSidebar.css';

const GET_AUDIT_LOGS = gql`
    query AuditLogsByMaterialIds($materialIds: [Int!]!, $limit: Int) {
        auditLogsByMaterialIds(materialIds: $materialIds, limit: $limit) {
            id
            worker {
                id
                name
                surname
            }
            username
            role
            action
            entity
            description
            material {
                id
                name
            }
            timestamp
        }
    }
`;

export default function NotificationSidebar({ isOpen, onClose, materialIds = [] }) {
    const { loading, error, data, refetch } = useQuery(GET_AUDIT_LOGS, {
        variables: { materialIds, limit: 100 },
        skip: !isOpen || materialIds.length === 0,
        fetchPolicy: "network-only"
    });

    // Оновлюємо дані при відкритті сайдбару
    useEffect(() => {
        if (isOpen && materialIds.length > 0) {
            refetch();
        }
    }, [isOpen, refetch, materialIds]);

    const getNotificationIcon = (entity, action) => {
        if (entity === "MATERIAL_REVIEW") {
            if (action === "CREATE") return { icon: "📝", color: "#2563eb" };
            if (action === "UPDATE") return { icon: "✏️", color: "#8b5cf6" };
            if (action === "DELETE") return { icon: "🗑️", color: "#ef4444" };
        }

        if (entity === "MATERIAL") {
            if (action === "CREATE") return { icon: "📄", color: "#10b981" };
            if (action === "UPDATE") return { icon: "📝", color: "#f59e0b" };
            if (action === "DELETE") return { icon: "🗑️", color: "#ef4444" };
        }

        // Default
        return { icon: "📢", color: "#64748b" };
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <>
            <div id="notificationBackdrop" className={`backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`notification-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="notification-sidebar-header">
                    <h2>Сповіщення про відгуки</h2>
                    <button className="close-button" onClick={onClose} aria-label="Закрити панель сповіщень">
                        ✕
                    </button>
                </div>

                <div className="notification-sidebar-content">
                    {loading && <div className="notification-loading">Завантаження сповіщень...</div>}
                    {error && <div className="notification-error">Помилка завантаження: {error.message}</div>}

                    {!loading && !error && (!data?.auditLogsByMaterialIds || data.auditLogsByMaterialIds.length === 0) && (
                        <div className="no-notifications">Немає сповіщень для відображення</div>
                    )}

                    {!loading && !error && data?.auditLogsByMaterialIds && data.auditLogsByMaterialIds.length > 0 && (
                        <ul className="notifications-list">
                            {data.auditLogsByMaterialIds.map(notification => {
                                const { icon, color } = getNotificationIcon(notification.entity, notification.action);

                                return (
                                    <li key={notification.id} className="notification-item">
                                        <div className="notification-icon" style={{ color }}>{icon}</div>
                                        <div className="notification-content">
                                            <div className="notification-header">
                        <span className="notification-type">
                          {notification.entity === "MATERIAL_REVIEW" ? "Відгук" :
                              notification.entity === "MATERIAL" ? "Матеріал" : notification.entity}
                        </span>
                                                <span className="notification-action" style={{ color }}>
                          {notification.action === "CREATE" ? "створено" :
                              notification.action === "UPDATE" ? "оновлено" : "видалено"}
                        </span>
                                            </div>
                                            <p className="notification-description">{notification.description}</p>
                                            <div className="notification-details">
                                                {notification.material && (
                                                    <div className="notification-material">
                                                        Матеріал: {notification.material.name}
                                                    </div>
                                                )}
                                                <div className="notification-user">
                                                    {notification.worker
                                                        ? `${notification.worker.name} ${notification.worker.surname}`
                                                        : notification.username}
                                                    {notification.role && ` (${notification.role})`}
                                                </div>
                                                <div className="notification-time">{formatTimestamp(notification.timestamp)}</div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}