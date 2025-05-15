// src/components/ui/NotificationSidebar/NotificationSidebar.jsx (Updated for TransactionLog schema)

import { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import './NotificationSidebar.css';
import { useSelector } from "react-redux";
import Button from '../../common/Button/Button';

// Updated GraphQL queries that use the new TransactionLog schema
const GET_REVIEW_LOGS = gql`
    query TransactionsByMaterialIds($materialIds: [Int!]!, $entityList: [AuditEntity!]!) {
        transactionsByMaterialIds(materialIds: $materialIds, entityList: $entityList) {
            id
            entityType
            entityId
            action
            description
            timestamp
            username
            role
            worker {
                id
                name
                surname
            }
            material {
                id
                name
            }
            review {
                id
                comments
            }
            rolledBack
            rollbackTransactionId
        }
    }
`;

const GET_TASK_LOGS = gql`
    query TransactionsByTaskIds($taskIds: [Int!]!, $entityList: [AuditEntity!]!) {
        transactionsByTaskIds(taskIds: $taskIds, entityList: $entityList) {
            id
            entityType
            entityId
            action
            description
            timestamp
            username
            role
            worker {
                id
                name
                surname
            }
            task {
                id
                name
            }
            rolledBack
            rollbackTransactionId
        }
    }
`;

const GET_PROJECT_LOGS = gql`
    query TransactionsByProjectIds($projectIds: [Int!]!, $entityList: [AuditEntity!]!) {
        transactionsByProjectIds(projectIds: $projectIds, entityList: $entityList) {
            id
            entityType
            entityId
            action
            description
            timestamp
            username
            role
            worker {
                id
                name
                surname
            }
            project {
                id
                name
            }
            rolledBack
            rollbackTransactionId
        }
    }
`;

export default function NotificationSidebar({
                                                isOpen,
                                                onClose,
                                                materialIds = [],
                                                taskIds = [],
                                                projectIds = []
                                            }) {
    const userRole = useSelector((s) => s.user.mainRole);
    const navigate = useNavigate();

    const isWorker = userRole === "WORKER";
    const isScrumMaster = userRole === "SCRUM_MASTER";
    const isProjectManager = userRole === "PROJECT_MANAGER";
    const isAdmin = userRole === "ADMIN";

    /* Select the appropriate query and variables */
    const query = isWorker
        ? GET_REVIEW_LOGS
        : isScrumMaster
            ? GET_TASK_LOGS
            : GET_PROJECT_LOGS;

    // Updated entity types to match the new schema
    const variables = isWorker
        ? { materialIds, entityList: ["MATERIAL_REVIEW"] }
        : isScrumMaster
            ? { taskIds, entityList: ["MATERIAL_REVIEW", "TASK", "MATERIAL"] }
            : { projectIds, entityList: ["MATERIAL_REVIEW", "TASK", "MATERIAL", "SERVICES_IN_PROGRESS"] };

    const skip =
        !isOpen ||
        (isWorker && materialIds.length === 0) ||
        (isScrumMaster && taskIds.length === 0) ||
        (isProjectManager && projectIds.length === 0);

    const { data, loading, error, refetch } = useQuery(query, {
        variables,
        skip,
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        if (!skip && isOpen) refetch();
    }, [isOpen, skip, refetch]);

    const getNotificationIcon = (entityType, action) => {
        const iconMap = {
            MATERIAL_REVIEW: { CREATE: "📝", UPDATE: "✏️", DELETE: "🗑️" },
            MATERIAL: { CREATE: "📄", UPDATE: "📝", DELETE: "🗑️" },
            TASK: { CREATE: "🧩", UPDATE: "🔧", DELETE: "🗑️" },
            PROJECT: { CREATE: "📁", UPDATE: "📝", DELETE: "🗑️" },
            SERVICES_IN_PROGRESS: { CREATE: "🔄", UPDATE: "🔧", DELETE: "🗑️" }
        };
        const colorMap = {
            CREATE: "#10b981",
            UPDATE: "#f59e0b",
            DELETE: "#ef4444",
        };

        return {
            icon: iconMap[entityType]?.[action] || "📢",
            color: colorMap[action] || "#64748b",
        };
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 60000);
        if (diff < 60) return `${diff} хв тому`;
        if (diff < 1440) return `${Math.floor(diff / 60)} год тому`;
        if (diff < 10080) return `${Math.floor(diff / 1440)} дн тому`;
        return date.toLocaleDateString();
    };

    const getActionText = (entityType, action) => {
        const dict = {
            MATERIAL_REVIEW: { CREATE: "Створено відгук", UPDATE: "Оновлено відгук", DELETE: "Видалено відгук" },
            MATERIAL: { CREATE: "Створено матеріал", UPDATE: "Оновлено матеріал", DELETE: "Видалено матеріал" },
            TASK: { CREATE: "Створено завдання", UPDATE: "Оновлено завдання", DELETE: "Видалено завдання" },
            PROJECT: { CREATE: "Створено проєкт", UPDATE: "Оновлено проєкт", DELETE: "Видалено проєкт" },
            SERVICES_IN_PROGRESS: { CREATE: "Створено сервіс", UPDATE: "Оновлено сервіс", DELETE: "Видалено сервіс" }
        };
        return dict[entityType]?.[action] || `${action.toLowerCase()} ${entityType.toLowerCase()}`;
    };

    // Get the appropriate data field based on user role
    const notifications = isWorker
        ? data?.transactionsByMaterialIds
        : isScrumMaster
            ? data?.transactionsByTaskIds
            : data?.transactionsByProjectIds;

    // Get entity name based on entity type
    const getEntityName = (notification) => {
        // Handle the new schema's entityType property
        if (notification.entityType === 'MATERIAL_REVIEW' && notification.material)
            return notification.material.name;
        else if (notification.entityType === 'MATERIAL' && notification.material)
            return notification.material.name;
        else if (notification.entityType === 'TASK' && notification.task)
            return notification.task.name;
        else if (notification.entityType === 'PROJECT' && notification.project)
            return notification.project.name;
        else if (notification.entityType === 'SERVICES_IN_PROGRESS' && notification.serviceInProgress)
            return notification.serviceInProgress.name || `Service #${notification.entityId}`;
        // If none of the above match, just return the entity type and ID
        return `${notification.entityType} #${notification.entityId}`;
    };

    const headingText = isWorker
        ? "Сповіщення про відгуки"
        : isScrumMaster
            ? "Сповіщення про завдання"
            : "Сповіщення про проєкти";

    // Function to navigate to logs panel
    const navigateToLogs = () => {
        onClose(); // Close the sidebar first
        navigate('/logs'); // Navigate to logs page
    };

    return (
        <>
            <div id="notificationBackdrop" className={`backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`notification-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="notification-sidebar-header">
                    <h2>{headingText}</h2>
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>

                <div className="notification-sidebar-content">
                    {/* View All Logs button - only visible for managers and admins */}
                    {(isProjectManager || isAdmin) && (
                        <div className="view-all-logs-container">
                            <Button
                                variant="primary"
                                size="small"
                                icon="📋"
                                className="view-all-logs-button"
                                onClick={navigateToLogs}
                            >
                                View All Logs
                            </Button>
                            <p className="logs-description">
                                Access the full audit log system to view and manage all system activities
                            </p>
                        </div>
                    )}

                    {loading && <div className="notification-loading">Завантаження сповіщень...</div>}
                    {error && <div className="notification-error">Помилка завантаження: {error.message}</div>}
                    {!loading && !error && (!notifications || notifications.length === 0) && (
                        <div className="no-notifications">Немає сповіщень для відображення</div>
                    )}

                    {!loading && !error && notifications?.length > 0 && (
                        <ul className="notifications-list">
                            {notifications.map((n) => {
                                const { icon, color } = getNotificationIcon(n.entityType, n.action);
                                const actionText = getActionText(n.entityType, n.action);
                                const entityName = getEntityName(n);

                                return (
                                    <li key={n.id} className={`notification-item ${n.rolledBack ? 'rolled-back' : ''}`}>
                                        <div className="notification-icon" style={{ color }}>{icon}</div>
                                        <div className="notification-content">
                                            <div className="notification-header">
                                                <span className="notification-type">{entityName}</span>
                                                <span className="notification-action" style={{ color }}>
                                                    {actionText}
                                                    {n.rolledBack && <span className="rollback-indicator"> (відмінено)</span>}
                                                </span>
                                            </div>
                                            {n.description && <p className="notification-description">{n.description}</p>}
                                            <div className="notification-details">
                                                <div className="notification-user">
                                                    {n.worker ? `${n.worker.name} ${n.worker.surname}` : n.username || "Користувач"}
                                                    <span className="notification-time">{formatTimestamp(n.timestamp)}</span>
                                                </div>
                                                {/* Show the rollback information if available */}
                                                {n.rollbackTransactionId && (
                                                    <div className="rollback-info">
                                                        <span className="rollback-label">ID транзакції відкату:</span>
                                                        <span className="rollback-id">{n.rollbackTransactionId}</span>
                                                    </div>
                                                )}
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