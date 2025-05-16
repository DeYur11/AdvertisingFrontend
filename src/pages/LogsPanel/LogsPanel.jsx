// src/pages/LogsPanel/LogsPanel.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useSubscription, gql } from "@apollo/client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./LogsPanel.css";

// Components
import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card/Card";
import Badge from "../../components/common/Badge/Badge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog/ConfirmationDialog";
import DatePicker from "../../components/common/DatePicker/DatePicker";

// =======  GraphQL  =======
const GET_PM_PROJECT_IDS = gql`
    query GetManagerProjects($managerId: ID!) {
        projectsByManager(managerId: $managerId) {
            id
        }
    }
`;

const GET_ALL_TRANSACTION_LOGS = gql`
    query TransactionsByProjectIds($projectIds: [Int!]!, $entityList: [AuditEntity!]!) {
        transactionsByProjectIds(projectIds: $projectIds, entityList: $entityList) {
            id
            entityType
            entityId
            action
            worker {
                id
                name
                surname
            }
            username
            role
            description
            timestamp
            rolledBack
            rollbackTransactionId
            project { id name }
            task    { id name }
            material{ id name }
            review  { id comments }
        }
    }
`;

const ROLLBACK_TRANSACTION = gql`
    mutation RollbackTransaction($transactionId: String!, $username: String!) {
        rollbackTransaction(transactionId: $transactionId, username: $username)
    }
`;

// Підписка на оновлення логів
const SUBSCRIBE_TO_AUDIT_LOGS = gql`
    subscription OnAuditLogByProjectIds($projectIds: [Int!]!, $entityList: [AuditEntity!]!) {
        onTransactionByProjectIds(projectIds: $projectIds, entityList: $entityList) {
            id
            entityType
            entityId
            action
            worker {
                id
                name
                surname
            }
            username
            role
            description
            timestamp
            rolledBack
            rollbackTransactionId
            project { id name }
            task    { id name }
            material{ id name }
            review  { id comments }
        }
    }
`;
// ======= /GraphQL  =======

export default function LogsPanel() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    const isAuthorized =
        user.mainRole === "ADMIN" || user.mainRole === "PROJECT_MANAGER";

    // ---------- get manager projects ----------
    const {
        loading: projectsLoading,
        error: projectsError,
        data: projectsData,
    } = useQuery(GET_PM_PROJECT_IDS, {
        variables: { managerId: user.workerId },
        skip: !user?.workerId,
        fetchPolicy: "network-only",
        onError: (e) => console.log(e),
    });

    const managerProjectIds = (projectsData?.projectsByManager ?? [])
        .map((p) => Number(p.id))
        .filter(Boolean);

    // ---------- logs ----------
    const {
        loading,
        error,
        data,
        refetch,
    } = useQuery(GET_ALL_TRANSACTION_LOGS, {
        variables: {
            projectIds: managerProjectIds,
            entityList: [
                "PROJECT",
                "TASK",
                "MATERIAL",
                "MATERIAL_REVIEW",
                "SERVICES_IN_PROGRESS",
            ],
        },
        skip: managerProjectIds.length === 0,
        onCompleted: (data) => console.log(data),
        onError: (err) => console.error("Помилка отримання логів:", err),
        fetchPolicy: "network-only",
    });

    // ---------- Підписка на оновлення логів ----------
    const [allLogs, setAllLogs] = useState([]);

    useEffect(() => {
        if (data?.transactionsByProjectIds) {
            setAllLogs(data.transactionsByProjectIds);
        }
    }, [data]);

    const { data: subscriptionData } = useSubscription(SUBSCRIBE_TO_AUDIT_LOGS, {
        variables: {
            projectIds: managerProjectIds,
            entityList: [
                "PROJECT",
                "TASK",
                "MATERIAL",
                "MATERIAL_REVIEW",
                "SERVICES_IN_PROGRESS",
            ],
        },
        skip: managerProjectIds.length === 0,
        onSubscriptionData: ({ subscriptionData }) => {
            const newLog = subscriptionData?.data?.onAuditLogByProjectIds;
            if (newLog) {
                // Додаємо новий лог до поточного стану і показуємо повідомлення
                setAllLogs(prev => [newLog, ...prev]);
                notify(`Нова дія: ${newLog.action} на ${newLog.entityType} від ${getUserDisplayName(newLog)}`, "info");
            }
        },
    });

    // ---------- filter state ----------
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedActions, setSelectedActions] = useState([]);
    const [selectedEntityTypes, setSelectedEntityTypes] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    // ---------- modal windows ----------
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showRollbackModal, setShowRollbackModal] = useState(false);

    // ---------- notifications ----------
    const [notification, setNotification] = useState({
        visible: false,
        message: "",
        type: "default",
    });
    const notify = (msg, type = "default") => {
        setNotification({ visible: true, message: msg, type });
        setTimeout(() => setNotification((p) => ({ ...p, visible: false })), 5000);
    };

    // ---------- mutations ----------
    const [rollbackTransaction, { loading: rollbackLoading }] = useMutation(
        ROLLBACK_TRANSACTION,
        {
            onCompleted: ({ rollbackTransaction }) => {
                if (rollbackTransaction) {
                    notify("Транзакцію успішно відкочено", "success");
                    refetch();
                } else notify("Не вдалося виконати відкат транзакції", "danger");
                setShowRollbackModal(false);
            },
            onError: (e) => {
                notify(`Помилка: ${e.message}`, "danger");
                setShowRollbackModal(false);
            },
        }
    );

    // ---------- filters ----------
    const filterLogs = (logs) =>
        logs.filter((log) => {
            const text = searchTerm.toLowerCase();
            const matchText =
                !searchTerm ||
                log.description?.toLowerCase().includes(text) ||
                log.entityType.toLowerCase().includes(text) ||
                log.username?.toLowerCase().includes(text) ||
                (log.worker &&
                    `${log.worker.name} ${log.worker.surname}`.toLowerCase().includes(text)) ||
                log.material?.name?.toLowerCase().includes(text) ||
                log.task?.name?.toLowerCase().includes(text) ||
                log.project?.name?.toLowerCase().includes(text);

            const dateMatch =
                (!startDate || new Date(log.timestamp) >= startDate) &&
                (!endDate || new Date(log.timestamp) <= endDate);

            const actionMatch =
                selectedActions.length === 0 || selectedActions.includes(log.action);

            const typeMatch =
                selectedEntityTypes.length === 0 || selectedEntityTypes.includes(log.entityType);

            const userMatch =
                selectedUsers.length === 0 ||
                selectedUsers.includes(log.username) ||
                (log.worker &&
                    selectedUsers.includes(`${log.worker.name} ${log.worker.surname}`));

            return matchText && dateMatch && actionMatch && typeMatch && userMatch;
        });

    // ---------- helper functions ----------
    const formatTimestamp = (t) => new Date(t).toLocaleString();

    const getUserDisplayName = (log) =>
        log.worker ? `${log.worker.name} ${log.worker.surname}` : log.username || "Система";

    const getEntityName = (log) => {
        switch (log.entityType) {
            case "MATERIAL":
                return log.material?.name || `Матеріал #${log.entityId}`;
            case "TASK":
                return log.task?.name || `Завдання #${log.entityId}`;
            case "PROJECT":
                return log.project?.name || `Проєкт #${log.entityId}`;
            case "MATERIAL_REVIEW":
                return log.review
                    ? `Рев'ю #${log.review.id} ${log.material ? `для ${log.material.name}` : ""}`
                    : `Рев'ю #${log.entityId}`;
            case "SERVICES_IN_PROGRESS":
                return `Сервіс #${log.entityId}`;
            default:
                return `${log.entityType} #${log.entityId}`;
        }
    };

    // ---------- UI for unauthorized ----------
    if (!isAuthorized) {
        return (
            <div className="access-denied">
                <div className="access-denied-icon">🔒</div>
                <h2>Доступ заборонено</h2>
                <p>У вас немає прав для перегляду цієї сторінки.</p>
                <Button variant="primary" onClick={() => navigate("/")}>
                    На головну
                </Button>
            </div>
        );
    }

    const logs = allLogs.length > 0
        ? filterLogs(allLogs)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // спадання
        : [];

    const actionTypes = [...new Set(allLogs?.map((l) => l.action) || [])].sort();
    const entityTypes = [...new Set(allLogs?.map((l) => l.entityType) || [])].sort();
    const users = [
        ...new Set(
            (allLogs || [])
                .map((l) => (l.worker ? `${l.worker.name} ${l.worker.surname}` : l.username))
                .filter(Boolean)
        ),
    ].sort();

    // ---------- JSX ----------
    return (
        <div className="logs-panel-container">
            {/* Header */}
            <div className="logs-header">
                <h1>Журнал транзакцій та історія дій</h1>
                <p className="logs-subtitle">
                    Відстежуйте дії системи, контролюйте зміни та за потреби відкочуйте транзакції.
                </p>
            </div>

            {/* Notification */}
            {notification.visible && (
                <div className={`alert alert-${notification.type}`}>{notification.message}</div>
            )}

            {/* Filters */}
            <Card variant="elevated" className="logs-filter-card">
                <div className="logs-filter-header">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Пошук за описом, сутністю, користувачем..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-search" aria-label="Очистити" onClick={() => setSearchTerm("")}>
                                ×
                            </button>
                        )}
                    </div>

                    <div className="filter-actions">
                        <Button variant="outline" size="small" onClick={() => setShowAdvancedFilters((s) => !s)}>
                            {showAdvancedFilters ? "Приховати фільтри" : "Показати фільтри"}
                        </Button>
                        {showAdvancedFilters && (
                            <Button
                                variant="outline"
                                size="small"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStartDate(null);
                                    setEndDate(null);
                                    setSelectedActions([]);
                                    setSelectedEntityTypes([]);
                                    setSelectedUsers([]);
                                }}
                            >
                                Скинути фільтри
                            </Button>
                        )}
                    </div>
                </div>

                {showAdvancedFilters && (
                    <div className="advanced-filters">
                        <div className="filter-section">
                            <h3>Діапазон дат</h3>
                            <div className="date-filters">
                                <div className="date-input">
                                    <label>Від:</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={setStartDate}
                                        placeholderText="Початкова дата"
                                        maxDate={endDate || new Date()}
                                    />
                                </div>
                                <div className="date-input">
                                    <label>До:</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={setEndDate}
                                        placeholderText="Кінцева дата"
                                        minDate={startDate}
                                        maxDate={new Date()}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3>Тип дії</h3>
                            <div className="filter-chips">
                                {actionTypes.map((a) => (
                                    <div
                                        key={a}
                                        className={`filter-chip ${selectedActions.includes(a) ? "selected" : ""}`}
                                        onClick={() =>
                                            setSelectedActions((prev) =>
                                                prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
                                            )
                                        }
                                    >
                                        {a}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3>Тип сутності</h3>
                            <div className="filter-chips">
                                {entityTypes.map((e) => (
                                    <div
                                        key={e}
                                        className={`filter-chip ${selectedEntityTypes.includes(e) ? "selected" : ""}`}
                                        onClick={() =>
                                            setSelectedEntityTypes((prev) =>
                                                prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
                                            )
                                        }
                                    >
                                        {e}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3>Користувач</h3>
                            <div className="filter-chips">
                                {users.map((u) => (
                                    <div
                                        key={u}
                                        className={`filter-chip ${selectedUsers.includes(u) ? "selected" : ""}`}
                                        onClick={() =>
                                            setSelectedUsers((prev) =>
                                                prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]
                                            )
                                        }
                                    >
                                        {u}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Loading state */}
            {loading && <div className="loading-indicator">Завантаження журналу транзакцій...</div>}

            {/* Error message */}
            {error && (
                <div className="error-message">
                    <h3>Помилка завантаження даних</h3>
                    <p>{error.message}</p>
                    <Button variant="outline" onClick={() => refetch()}>
                        Спробувати ще
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && logs.length === 0 && (
                <div className="no-logs-message">
                    {searchTerm ||
                    startDate ||
                    endDate ||
                    selectedActions.length > 0 ||
                    selectedEntityTypes.length > 0 ||
                    selectedUsers.length > 0
                        ? "Немає журналів, що відповідають критеріям фільтру"
                        : "Немає журналів транзакцій для ваших проєктів"}
                </div>
            )}

            {/* Table of logs */}
            {!loading && !error && logs.length > 0 && (
                <>
                    <div className="logs-summary">Знайдено {logs.length} записів</div>
                    <div className="logs-table-wrapper">
                        <table className="logs-table">
                            <thead>
                            <tr>
                                <th className="timestamp-col">Час</th>
                                <th className="action-col">Дія</th>
                                <th className="entity-col">Тип сутності</th>
                                <th className="entity-name-col">Назва сутності</th>
                                <th className="user-col">Користувач</th>
                                <th className="description-col">Опис</th>
                                <th className="actions-col">Дії</th>
                            </tr>
                            </thead>
                            <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} className={`log-row ${log.action?.toLowerCase()}`}>
                                    <td className="timestamp-col">{formatTimestamp(log.timestamp)}</td>
                                    <td className="action-col">
                                        <Badge
                                            variant={
                                                log.action === "CREATE"
                                                    ? "success"
                                                    : log.action === "DELETE"
                                                        ? "danger"
                                                        : "primary"
                                            }
                                            size="small"
                                        >
                                            {log.action}
                                        </Badge>
                                        {log.rolledBack && <Badge variant="warning" size="small">ВІДКАТО</Badge>}
                                    </td>
                                    <td className="entity-col">{log.entityType}</td>
                                    <td className="entity-name-col">{getEntityName(log)}</td>
                                    <td className="user-col">
                                        {getUserDisplayName(log)}
                                        <div className="user-role">{log.role}</div>
                                    </td>
                                    <td className="description-col">{log.description}</td>
                                    <td className="actions-col">
                                        {log.rolledBack ? (
                                            <span className="cannot-undo">Відкотили</span>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedTransaction(log);
                                                    setShowRollbackModal(true);
                                                }}
                                                disabled={["DELETE", "ROLLBACK"].includes(log.action)}
                                            >
                                                Відкотити
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Rollback confirmation modal */}
            <ConfirmationDialog
                isOpen={showRollbackModal}
                onClose={() => setShowRollbackModal(false)}
                onConfirm={() =>
                    rollbackTransaction({
                        variables: {
                            transactionId: selectedTransaction?.id,
                            username: user.username,
                        },
                    })
                }
                title="Підтвердити відкат"
                message={`Ви впевнені, що хочете відкотити дію ${selectedTransaction?.action} над ${selectedTransaction?.entityType} #${selectedTransaction?.entityId}?`}
                confirmText="Відкотити"
                cancelText="Скасувати"
                variant="danger"
            />
        </div>
    );
}