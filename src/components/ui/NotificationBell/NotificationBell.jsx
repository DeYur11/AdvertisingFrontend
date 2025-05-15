// src/components/ui/NotificationBell/NotificationBell.jsx (Updated for TransactionLog schema)

import { useState, useRef, useEffect, useMemo } from "react";
import { useSubscription, gql } from "@apollo/client";
import { useSelector } from "react-redux";
import "./NotificationBell.css";

/* ───── Updated GraphQL subscriptions for TransactionLog schema ───── */
const SUB_MATERIAL_REVIEW = gql`
    subscription OnTransactionByMaterialIds($materialIds: [Int!]!, $entityList: [AuditEntity!]!) {
        onTransactionByMaterialIds(materialIds: $materialIds, entityList: $entityList) {
            id
            entityType
            entityId
            action
            description
            timestamp
            worker { id name surname }
            material { id name }
            review { id comments }
            username
            role
            rolledBack
            rollbackTransactionId
        }
    }
`;

const SUB_TASK = gql`
    subscription OnTransactionByTaskIds($taskIds: [Int!]!, $entityList: [AuditEntity!]!) {
        onTransactionByTaskIds(entityList: $entityList, taskIds: $taskIds) {
            id
            entityType
            entityId
            action
            description
            timestamp
            worker { id name surname }
            task { id name }
            username
            role
            rolledBack
            rollbackTransactionId
        }
    }
`;

const SUB_PROJECT = gql`
    subscription OnTransactionByProjectIds($projectIds: [Int!]!, $entityList: [AuditEntity!]!) {
        onTransactionByProjectIds(projectIds: $projectIds, entityList: $entityList) {
            id
            entityType
            entityId
            action
            description
            timestamp
            worker { id name surname }
            project { id name }
            username
            role
            rolledBack
            rollbackTransactionId
        }
    }
`;

export default function NotificationBell({
                                             materialIds = [],
                                             taskIds = [],
                                             projectIds = [],
                                             onToggleSidebar
                                         }) {
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const notificationSound = useRef(null);
    const role = useSelector((s) => s.user.mainRole);

    const isWorker = role === "WORKER";
    const isScrum = role === "SCRUM_MASTER";
    const isPm = role === "PROJECT_MANAGER";

    useEffect(() => {
        notificationSound.current = new Audio("/notification-sound.mp3");
    }, []);

    const { subscriptionDoc, variables, skip } = useMemo(() => {
        if (isWorker) {
            return {
                subscriptionDoc: SUB_MATERIAL_REVIEW,
                variables: {
                    materialIds,
                    entityList: ["MATERIAL_REVIEW"]
                },
                skip: materialIds.length === 0
            };
        }
        if (isScrum) {
            return {
                subscriptionDoc: SUB_TASK,
                variables: {
                    taskIds,
                    entityList: ["TASK", "MATERIAL", "MATERIAL_REVIEW"]
                },
                skip: taskIds.length === 0
            };
        }
        if (isPm) {
            return {
                subscriptionDoc: SUB_PROJECT,
                variables: {
                    projectIds,
                    entityList: ["PROJECT", "TASK", "MATERIAL", "SERVICES_IN_PROGRESS", "MATERIAL_REVIEW"]
                },
                skip: projectIds.length === 0
            };
        }
        return { subscriptionDoc: null, variables: {}, skip: true };
    }, [isWorker, isScrum, isPm, materialIds, taskIds, projectIds]);

    const { data } = useSubscription(subscriptionDoc || gql`subscription { _empty }`, {
        variables,
        skip,
        onError: (error) => console.error("Notification subscription error:", error)
    });

    useEffect(() => {
        if (data && !skip) {
            // Ignore rolled back transactions when determining if there's a new notification
            const transaction = isWorker
                ? data.onTransactionByMaterialIds
                : isScrum
                    ? data.onTransactionByTaskIds
                    : data.onTransactionByProjectIds;

            if (transaction && !transaction.rolledBack) {
                setHasNewNotification(true);
                notificationSound.current?.play().catch(err => {
                    console.warn("Не вдалося відтворити звук сповіщення:", err.message);
                });
            }
        }
    }, [data, skip, isWorker, isScrum]);

    const handleClick = () => {
        onToggleSidebar();
        setHasNewNotification(false);
    };

    return (
        <div className="notification-bell-container">
            <button
                className="notification-bell-button"
                onClick={handleClick}
                aria-label="Сповіщення"
            >
                <span className="bell-icon">🔔</span>
                {hasNewNotification && <span className="notification-indicator" />}
            </button>
        </div>
    );
}