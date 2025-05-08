// src/components/ui/NotificationBell/NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { useQuery, useSubscription, gql } from '@apollo/client';
import './NotificationBell.css';
import * as logger from "react-toastify";

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

const REVIEW_AUDIT_LOG_SUBSCRIPTION = gql`
    subscription OnReviewAuditLogByMaterialIds($materialIds: [Int!]!) {
        onReviewAuditLogByMaterialIds(materialIds: $materialIds) {
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

export default function NotificationBell({ materialIds = [], onToggleSidebar }) {
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const notificationSound = useRef(null);

    // Ініціалізуємо звук сповіщення
    useEffect(() => {
        notificationSound.current = new Audio('/notification-sound.mp3');
    }, []);

    // Підписка на нові повідомлення
    const { data: subscriptionData } = useSubscription(REVIEW_AUDIT_LOG_SUBSCRIPTION, {
        variables: { materialIds },
        skip: materialIds.length === 0,
        onError: (error) => {
            console.error(error);
        }
    });

    // Обробка нових сповіщень
    useEffect(() => {
        if (subscriptionData?.onReviewAuditLogByMaterialIds) {
            // Показуємо індикатор нового сповіщення
            setHasNewNotification(true);

            // Відтворюємо звук
            if (notificationSound.current) {
                notificationSound.current.play().catch(e => {
                    console.log("Не вдалося автоматично відтворити звук", e);
                });
            }
        }
    }, [subscriptionData]);

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
                    <span className="notification-indicator"></span>
                )}
            </button>
        </div>
    );
}