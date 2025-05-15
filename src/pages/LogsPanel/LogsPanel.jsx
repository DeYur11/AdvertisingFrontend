// src/pages/LogsPanel/LogsPanel.jsx
import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./LogsPanel.css";

// Компоненти
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

const GET_ROLLBACK_CANDIDATES = gql`
    query GetRollbackCandidates($entityType: String!, $entityId: Int!) {
        getRollbackCandidates(entityType: $entityType, entityId: $entityId) {
            id
            entityType
            entityId
            action
            worker { id name surname }
            username
            role
            description
            timestamp
            rolledBack
            rollbackTransactionId
        }
    }
`;

const ROLLBACK_TRANSACTION = gql`
    mutation RollbackTransaction($transactionId: String!, $username: String!) {
        rollbackTransaction(transactionId: $transactionId, username: $username)
    }
`;

const RESTORE_ENTITY_TO_POINT = gql`
    mutation RestoreEntityToPoint($entityType: String!, $entityId: Int!, $timestamp: String!) {
        restoreEntityToPoint(entityType: $entityType, entityId: $entityId, timestamp: $timestamp) {
            success
            message
            transactionId
        }
    }
`;
// ======= /GraphQL  =======

export default function LogsPanel() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    const isAuthorized =
        user.mainRole === "ADMIN" || user.mainRole === "PROJECT_MANAGER";

    // ---------- отримуємо проєкти менеджера ----------
    const {
        loading: projectsLoading,
        error: projectsError,
        data: projectsData,
    } = useQuery(GET_PM_PROJECT_IDS, {
        variables: { managerId: user.workerId },
        skip: !user?.workerId,
        fetchPolicy: "network-only",
        onError: (e) => {
            console.log(e)
        }
    });

    const managerProjectIds = (projectsData?.projectsByManager ?? [])
        .map(p => Number(p.id))        // або parseInt(p.id, 10)
        .filter(Boolean);
    // ---------- журнали ----------
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
        onCompleted: (data) => {
            console.log(data);
        },
        onError: (err) => console.error("Помилка отримання логів:", err),
        fetchPolicy: "network-only",
    });

    // ---------- кандидати на відкат ----------
    const [selectedEntityData, setSelectedEntityData] = useState({
        type: null,
        id: null,
    });

    const {
        loading: rollbacksLoading,
        error: rollbacksError,
        data: rollbackCandidatesData,
        refetch: refetchRollbackCandidates,
    } = useQuery(GET_ROLLBACK_CANDIDATES, {
        variables: {
            entityType: selectedEntityData.type,
            entityId: selectedEntityData.id,
        },
        skip: !selectedEntityData.type || !selectedEntityData.id,
        fetchPolicy: "network-only",
    });

    // ---------- стан фільтрів ----------
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedActions, setSelectedActions] = useState([]);
    const [selectedEntityTypes, setSelectedEntityTypes] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    // ---------- модальні вікна ----------
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showRollbackModal, setShowRollbackModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoreTimestamp, setRestoreTimestamp] = useState(null);

    // ---------- нотифікації ----------
    const [notification, setNotification] = useState({
        visible: false,
        message: "",
        type: "default",
    });
    const notify = (msg, type = "default") => {
        setNotification({ visible: true, message: msg, type });
        setTimeout(() => setNotification((p) => ({ ...p, visible: false })), 5000);
    };

    // ---------- мутації ----------
    const [rollbackTransaction, { loading: rollbackLoading }] = useMutation(
        ROLLBACK_TRANSACTION,
        {
            onCompleted: ({ rollbackTransaction }) => {
                if (rollbackTransaction) {
                    notify("Транзакцію успішно відкочено", "success");
                    refetch();
                    refetchRollbackCandidates();
                } else notify("Не вдалося виконати відкат", "danger");
                setShowRollbackModal(false);
            },
            onError: (e) => {
                notify(`Помилка: ${e.message}`, "danger");
                setShowRollbackModal(false);
            },
        }
    );

    const [restoreEntityToPoint, { loading: restoreLoading }] = useMutation(
        RESTORE_ENTITY_TO_POINT,
        {
            onCompleted: ({ restoreEntityToPoint }) => {
                const { success, message } = restoreEntityToPoint;
                success ? notify(message, "success") : notify(message, "danger");
                refetch();
                refetchRollbackCandidates();
                setShowRestoreModal(false);
            },
            onError: (e) => {
                notify(`Помилка: ${e.message}`, "danger");
                setShowRestoreModal(false);
            },
        }
    );

    // ---------- фільтри ----------
    const filterLogs = (logs) =>
        logs.filter((log) => {
            const text = searchTerm.toLowerCase();
            const matchText =
                !searchTerm ||
                log.description?.toLowerCase().includes(text) ||
                log.entityType.toLowerCase().includes(text) ||
                log.username?.toLowerCase().includes(text) ||
                (log.worker &&
                    `${log.worker.name} ${log.worker.surname}`
                        .toLowerCase()
                        .includes(text)) ||
                log.material?.name?.toLowerCase().includes(text) ||
                log.task?.name?.toLowerCase().includes(text) ||
                log.project?.name?.toLowerCase().includes(text);

            const dateMatch =
                (!startDate || new Date(log.timestamp) >= startDate) &&
                (!endDate || new Date(log.timestamp) <= endDate);

            const actionMatch =
                selectedActions.length === 0 ||
                selectedActions.includes(log.action);

            const typeMatch =
                selectedEntityTypes.length === 0 ||
                selectedEntityTypes.includes(log.entityType);

            const userMatch =
                selectedUsers.length === 0 ||
                selectedUsers.includes(log.username) ||
                (log.worker &&
                    selectedUsers.includes(
                        `${log.worker.name} ${log.worker.surname}`
                    ));

            return matchText && dateMatch && actionMatch && typeMatch && userMatch;
        });

    // ---------- допоміжні функції ----------
    const formatTimestamp = (t) => new Date(t).toLocaleString();
    const getUserDisplayName = (log) =>
        log.worker
            ? `${log.worker.name} ${log.worker.surname}`
            : log.username || "System";

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
                    ? `Рев'ю #${log.review.id} ${
                        log.material ? `для ${log.material.name}` : ""
                    }`
                    : `Рев'ю #${log.entityId}`;
            case "SERVICES_IN_PROGRESS":
                return `Сервіс #${log.entityId}`;
            default:
                return `${log.entityType} #${log.entityId}`;
        }
    };

    // ---------- UI неавторизованих ----------
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

    const logs =
        data?.transactionsByProjectIds ? filterLogs(data.transactionsByProjectIds) : [];

    const actionTypes = [
        ...new Set(data?.transactionsByProjectIds?.map((l) => l.action) || []),
    ].sort();
    const entityTypes = [
        ...new Set(data?.transactionsByProjectIds?.map((l) => l.entityType) || []),
    ].sort();
    const users = [
        ...new Set(
            (data?.transactionsByProjectIds || [])
                .map((l) =>
                    l.worker ? `${l.worker.name} ${l.worker.surname}` : l.username
                )
                .filter(Boolean)
        ),
    ].sort();

    // ---------- JSX ----------
    return (
        <div className="logs-panel-container">
            {/* Заголовок */}
            <div className="logs-header">
                <h1>Журнал дій та історія транзакцій</h1>
                <p className="logs-subtitle">
                    Переглядайте та керуйте діями системи, відстежуйте зміни та за
                    потреби відкочуйте транзакції.
                </p>
            </div>

            {/* Нотифікація */}
            {notification.visible && (
                <div className={`alert alert-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Фільтри */}
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
                            <button
                                className="clear-search"
                                aria-label="Очистити"
                                onClick={() => setSearchTerm("")}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="filter-actions">
                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => setShowAdvancedFilters((s) => !s)}
                        >
                            {showAdvancedFilters ? "Сховати фільтри" : "Показати фільтри"}
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
                                Очистити фільтри
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
                                    <label>З:</label>
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
                                        className={`filter-chip ${
                                            selectedActions.includes(a) ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedActions((prev) =>
                                                prev.includes(a)
                                                    ? prev.filter((x) => x !== a)
                                                    : [...prev, a]
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
                                        className={`filter-chip ${
                                            selectedEntityTypes.includes(e) ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedEntityTypes((prev) =>
                                                prev.includes(e)
                                                    ? prev.filter((x) => x !== e)
                                                    : [...prev, e]
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
                                        className={`filter-chip ${
                                            selectedUsers.includes(u) ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedUsers((prev) =>
                                                prev.includes(u)
                                                    ? prev.filter((x) => x !== u)
                                                    : [...prev, u]
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

            {/* Стан завантаження */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Завантаження журналу дій...</p>
                </div>
            )}

            {/* Повідомлення про помилку */}
            {error && (
                <div className="error-message">
                    <h3>Помилка завантаження даних</h3>
                    <p>{error.message}</p>
                    <Button variant="outline" onClick={() => refetch()}>
                        Спробувати ще раз
                    </Button>
                </div>
            )}

            {/* Порожній стан */}
            {!loading && !error && logs.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>Немає записів журналу</h3>
                    <p>
                        {searchTerm || startDate || endDate || selectedActions.length > 0 || selectedEntityTypes.length > 0 || selectedUsers.length > 0
                            ? "Немає записів, що відповідають вашим фільтрам"
                            : "Ще немає записів журналу для ваших проєктів"}
                    </p>
                    {searchTerm || startDate || endDate || selectedActions.length > 0 || selectedEntityTypes.length > 0 || selectedUsers.length > 0 ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setStartDate(null);
                                setEndDate(null);
                                setSelectedActions([]);
                                setSelectedEntityTypes([]);
                                setSelectedUsers([]);
                            }}
                        >
                            Очистити фільтри
                        </Button>
                    ) : null}
                </div>
            )}

            {/* Список карток з логами */}
            {!loading && !error && logs.length > 0 && (
                <div className="logs-list">
                    <div className="logs-summary">
                        <h3>Знайдено {logs.length} записів</h3>
                    </div>

                    {logs.map((log) => (
                        <Card key={log.id} className="log-card">
                            <div className="log-header">
                                <div className="log-entity-info">
                                    <Badge variant={log.rolledBack ? "warning" : "primary"}>
                                        {log.entityType}
                                    </Badge>
                                    <h3 className="log-entity-name">{getEntityName(log)}</h3>
                                </div>
                                <div className="log-timestamp">
                                    {formatTimestamp(log.timestamp)}
                                </div>
                            </div>

                            <div className="log-content">
                                <div className="log-action">
                                    <Badge variant={log.action === "CREATE" ? "success" :
                                        log.action === "DELETE" ? "danger" : "info"}>
                                        {log.action}
                                    </Badge>
                                    <p className="log-description">{log.description}</p>
                                </div>

                                <div className="log-user">
                                    <span className="user-role">{log.role}</span>
                                    <span className="user-name">{getUserDisplayName(log)}</span>
                                </div>
                            </div>

                            <div className="log-footer">
                                {log.rolledBack ? (
                                    <Badge variant="warning">Відкочено</Badge>
                                ) : (
                                    <div className="log-actions">
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => {
                                                setSelectedTransaction(log);
                                                setShowRollbackModal(true);
                                            }}
                                            disabled={["DELETE", "ROLLBACK"].includes(log.action)}
                                        >
                                            Відкотити дію
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => {
                                                setSelectedEntityData({
                                                    type: log.entityType,
                                                    id: log.entityId,
                                                });
                                                setRestoreTimestamp(log.timestamp);
                                                setShowRestoreModal(true);
                                            }}
                                        >
                                            Відновити до цього стану
                                        </Button>
                                    </div>
                                )}

                                {log.rollbackTransactionId && (
                                    <div className="rollback-info">
                                        <span>Відкочена транзакція: {log.rollbackTransactionId}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Модальне підтвердження відкату */}
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

            {/* Модальне підтвердження відновлення */}
            <ConfirmationDialog
                isOpen={showRestoreModal}
                onClose={() => setShowRestoreModal(false)}
                onConfirm={() =>
                    restoreEntityToPoint({
                        variables: {
                            entityType: selectedEntityData.type,
                            entityId: selectedEntityData.id,
                            timestamp: restoreTimestamp,
                        },
                    })
                }
                title="Підтвердити відновлення"
                message={`Відновити ${selectedEntityData.type} #${selectedEntityData.id} до стану на ${formatTimestamp(
                    restoreTimestamp
                )}?`}
                confirmText="Відновити"
                cancelText="Скасувати"
                variant="danger"
            />
        </div>
    );
}
