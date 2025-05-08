import { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import './NotificationSidebar.css';
import {useSelector} from "react-redux";

// Запити на кожен тип сповіщень
// 🔄 Замість GET_REVIEW_LOGS
const GET_REVIEW_LOGS = gql`
    query AuditLogsByMaterialIds($materialIds: [Int!]!, $entityList: [AuditEntity!]!) {
        auditLogsByMaterialIds(materialIds: $materialIds, entityList: $entityList) {
            id action entity description timestamp username
            worker { id name surname }
            material { id name }
        }
    }
`;


const GET_TASK_LOGS = gql`
    query AuditLogsByTaskIds(
        $taskIds: [Int!]!
        $entityList: [AuditEntity!]!
    ) {
        auditLogsByTaskIds(taskIds: $taskIds, entityList: $entityList) {
            id action entity description timestamp username
            worker { id name surname }
        }
    }
`;

const GET_PROJECT_LOGS = gql`
    query AuditLogsByProjectIds(
        $projectIds: [Int!]!
        $entityList: [AuditEntity!]!
    ) {
        auditLogsByProjectIds(projectIds: $projectIds, entityList: $entityList) {
            id action entity description timestamp username
            worker { id name surname }
        }
    }
`;

export default function NotificationSidebar({
                                                isOpen,
                                                onClose,
                                                materialIds = [],
                                                taskIds = [],         // ← передай список завдань із батьківського компонента
                                                projectIds = []       // ← передай список проєктів
                                            }) {
    const userRole = useSelector((s) => s.user.mainRole);

    const isWorker = userRole === "WORKER";
    const isScrumMaster = userRole === "SCRUM_MASTER";
    const isProjectManager = userRole === "PROJECT_MANAGER";

    /* вибір запиту та змінних */
    const query = isWorker
        ? GET_REVIEW_LOGS
        : isScrumMaster
            ? GET_TASK_LOGS
            : GET_PROJECT_LOGS;

    const variables = isWorker
        ? { materialIds, entityList: ["MATERIAL_REVIEW"] }
        : isScrumMaster
            ? { taskIds, entityList: ["TASK"] }          // можна додати інші сутності
            : { projectIds, entityList: ["PROJECT"] };   // за потреби: ["SERVICES_IN_PROGRESS", …]

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

    const getNotificationIcon = (entity, action) => {
        const iconMap = {
            MATERIAL_REVIEW: { CREATE: "📝", UPDATE: "✏️", DELETE: "🗑️" },
            MATERIAL: { CREATE: "📄", UPDATE: "📝", DELETE: "🗑️" },
            TASK: { CREATE: "🧩", UPDATE: "🔧", DELETE: "🗑️" },
            PROJECT: { CREATE: "📁", UPDATE: "📝", DELETE: "🗑️" },
        };
        const colorMap = {
            CREATE: "#10b981",
            UPDATE: "#f59e0b",
            DELETE: "#ef4444",
        };

        return {
            icon: iconMap[entity]?.[action] || "📢",
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

    const getActionText = (entity, action) => {
        const dict = {
            MATERIAL_REVIEW: { CREATE: "Створено відгук", UPDATE: "Оновлено відгук", DELETE: "Видалено відгук" },
            MATERIAL: { CREATE: "Створено матеріал", UPDATE: "Оновлено матеріал", DELETE: "Видалено матеріал" },
            TASK: { CREATE: "Створено завдання", UPDATE: "Оновлено завдання", DELETE: "Видалено завдання" },
            PROJECT: { CREATE: "Створено проєкт", UPDATE: "Оновлено проєкт", DELETE: "Видалено проєкт" },
        };
        return dict[entity]?.[action] || `${action.toLowerCase()} ${entity.toLowerCase()}`;
    };

    const notifications = isWorker
        ? data?.auditLogsByMaterialIds
        : isScrumMaster
            ? data?.auditLogsByTaskIds
            : data?.auditLogsByProjectIds;

    const headingText = isWorker
        ? "Сповіщення про відгуки"
        : isScrumMaster
            ? "Сповіщення про завдання"
            : "Сповіщення про проєкти";

    return (
        <>
            <div id="notificationBackdrop" className={`backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`notification-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="notification-sidebar-header">
                    <h2>{headingText}</h2>
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>

                <div className="notification-sidebar-content">
                    {loading && <div className="notification-loading">Завантаження сповіщень...</div>}
                    {error && <div className="notification-error">Помилка завантаження: {error.message}</div>}
                    {!loading && !error && (!notifications || notifications.length === 0) && (
                        <div className="no-notifications">Немає сповіщень для відображення</div>
                    )}

                    {!loading && !error && notifications?.length > 0 && (
                        <ul className="notifications-list">
                            {notifications.map((n) => {
                                const { icon, color } = getNotificationIcon(n.entity, n.action);
                                const actionText = getActionText(n.entity, n.action);
                                return (
                                    <li key={n.id} className="notification-item">
                                        <div className="notification-icon" style={{ color }}>{icon}</div>
                                        <div className="notification-content">
                                            <div className="notification-header">
                                                <span className="notification-type">{n.material?.name || n.entity}</span>
                                                <span className="notification-action" style={{ color }}>{actionText}</span>
                                            </div>
                                            {n.description && <p className="notification-description">{n.description}</p>}
                                            <div className="notification-details">
                                                <div className="notification-user">
                                                    {n.worker ? `${n.worker.name} ${n.worker.surname}` : n.username || "Користувач"}
                                                    <span className="notification-time">{formatTimestamp(n.timestamp)}</span>
                                                </div>
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
