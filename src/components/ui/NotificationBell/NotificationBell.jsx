// src/components/ui/NotificationBell/NotificationBell.jsx
import { useState, useRef, useEffect } from "react";
import { useSubscription, gql } from "@apollo/client";
import { useSelector } from "react-redux";
import "./NotificationBell.css";

/* ───── GraphQL subscriptions ───── */

/* 1. WORKER → матеріали (лише рецензії) */
const SUB_MATERIAL_REVIEW = gql`
    subscription OnAuditLogByMaterialIds(
        $materialIds: [Int!]!
        $entityList: [AuditEntity!]!
    ) {
        onAuditLogByMaterialIds(
            materialIds: $materialIds
            entityList: $entityList
        ) {
            id action entity description timestamp
            worker { id name surname }
            material { id name }
            username role
        }
    }
`;

/* 2. SCRUM-MASTER → завдання (можна лишити тільки TASK) */
const SUB_TASK = gql`
    subscription OnAuditLogByTaskIds(
        $taskIds: [Int!]!
        $entityList: [AuditEntity!]!
    ) {
        onAuditLogByTaskIds(taskIds: $taskIds, entityList: $entityList) {
            id action entity description timestamp
            worker { id name surname }
            username role
        }
    }
`;

/* 3. PROJECT-MANAGER → проєкти (лише PROJECT) */
const SUB_PROJECT = gql`
    subscription OnAuditLogByProjectIds(
        $projectIds: [Int!]!
        $entityList: [AuditEntity!]!
    ) {
        onAuditLogByProjectIds(
            projectIds: $projectIds
            entityList: $entityList
        ) {
            id action entity description timestamp
            worker { id name surname }
            username role
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

    /* ── роль користувача ── */
    const role = useSelector((s) => s.user.mainRole);
    const isWorker = role === "WORKER";
    const isScrum = role === "SCRUM_MASTER";
    const isPm = role === "PROJECT_MANAGER";

    /* ── ініціал звуку ── */
    useEffect(() => {
        notificationSound.current = new Audio("/notification-sound.mp3");
    }, []);

    /* ── вибір підписки та змінних ── */
    const [subscriptionDoc, variables, skip] = (() => {
        if (isWorker)
            return [
                SUB_MATERIAL_REVIEW,
                { materialIds, entityList: ["MATERIAL_REVIEW"] },
                materialIds.length === 0
            ];
        if (isScrum)
            return [
                SUB_TASK,
                { taskIds, entityList: ["TASK"] },
                taskIds.length === 0
            ];
        if (isPm)
            return [
                SUB_PROJECT,
                { projectIds, entityList: ["PROJECT"] },
                projectIds.length === 0
            ];
        /* інші ролі не слухають нічого */
        return [null, {}, true];
    })();

    /* ── підписка ── */
    const { data } = useSubscription(subscriptionDoc, {
        variables,
        skip,
        onError: console.error
    });

    /* ── індикатор + звук ── */
    useEffect(() => {
        if (data) {
            setHasNewNotification(true);
            notificationSound.current?.play().catch(() => {});
        }
    }, [data]);

    /* ── клік по дзвіночку ── */
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
                {hasNewNotification && (
                    <span className="notification-indicator" />
                )}
            </button>
        </div>
    );
}
