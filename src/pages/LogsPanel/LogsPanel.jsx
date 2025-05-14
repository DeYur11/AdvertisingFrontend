// src/pages/LogsPanel/LogsPanel.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import Pagination from '../../components/common/Pagination/Pagination';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog/ConfirmationDialog';
import './LogsPanel.css';

// GraphQL queries
const GET_AUDIT_LOGS = gql`
    query GetAuditLogs($filter: AuditLogFilter, $page: Int, $size: Int) {
        auditLogs(filter: $filter, page: $page, size: $size) {
            content {
                id
                action
                entity
                description
                timestamp
                username
                role
                isUndoable
                worker {
                    id
                    name
                    surname
                }
                material {
                    id
                    name
                }
                project {
                    id
                    name
                }
                task {
                    id
                    name
                }
                review {
                    id
                    comments
                }
            }
            pageInfo {
                totalElements
                totalPages
                size
                number
            }
        }
    }
`;

const UNDO_ACTION = gql`
    mutation UndoAction($logId: ID!) {
        undoAction(logId: $logId) {
            id
            success
            message
        }
    }
`;

export default function LogsPanel() {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [filters, setFilters] = useState({});
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [entityFilter, setEntityFilter] = useState([]);
    const [actionFilter, setActionFilter] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmUndoLog, setConfirmUndoLog] = useState(null);
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    const user = useSelector(state => state.user);
    const navigate = useNavigate();

    // Filter options
    const entityOptions = [
        { label: 'Material', value: 'MATERIAL' },
        { label: 'Task', value: 'TASK' },
        { label: 'Project', value: 'PROJECT' },
        { label: 'Review', value: 'MATERIAL_REVIEW' },
        { label: 'Service', value: 'SERVICE' },
        { label: 'Service Implementation', value: 'SERVICES_IN_PROGRESS' }
    ];

    const actionOptions = [
        { label: 'Create', value: 'CREATE' },
        { label: 'Update', value: 'UPDATE' },
        { label: 'Delete', value: 'DELETE' },
        { label: 'Status Change', value: 'STATUS_CHANGE' }
    ];

    // Build filter object for the query
    const buildFilterInput = () => {
        const filterInput = {};

        if (searchQuery) {
            filterInput.descriptionContains = searchQuery;
        }

        if (entityFilter.length > 0) {
            filterInput.entityList = entityFilter;
        }

        if (actionFilter.length > 0) {
            filterInput.actionList = actionFilter;
        }

        if (dateFrom) {
            filterInput.fromDate = new Date(dateFrom).toISOString();
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filterInput.toDate = toDate.toISOString();
        }

        return filterInput;
    };

    // Fetch logs data
    const { data, loading, error, refetch } = useQuery(GET_AUDIT_LOGS, {
        variables: {
            filter: buildFilterInput(),
            page: page - 1, // GraphQL API uses 0-based indexing
            size
        },
        fetchPolicy: 'network-only'
    });

    // Undo action mutation
    const [undoAction, { loading: undoLoading }] = useMutation(UNDO_ACTION, {
        onCompleted: (data) => {
            if (data.undoAction.success) {
                toast.success(`Action successfully undone: ${data.undoAction.message}`);
                refetch();
            } else {
                toast.error(`Failed to undo action: ${data.undoAction.message}`);
            }
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    // Handle undo confirmation
    const handleConfirmUndo = async () => {
        if (!confirmUndoLog) return;

        try {
            await undoAction({ variables: { logId: confirmUndoLog.id } });
        } catch (error) {
            console.error('Error when undoing action:', error);
        } finally {
            setConfirmUndoLog(null);
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setEntityFilter([]);
        setActionFilter([]);
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    // Apply filters and search
    const applyFilters = () => {
        setPage(1);
        refetch();
    };

    // Toggle entity filter
    const toggleEntityFilter = (entity) => {
        setEntityFilter(prev =>
            prev.includes(entity)
                ? prev.filter(e => e !== entity)
                : [...prev, entity]
        );
    };

    // Toggle action filter
    const toggleActionFilter = (action) => {
        setActionFilter(prev =>
            prev.includes(action)
                ? prev.filter(a => a !== action)
                : [...prev, action]
        );
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    // Get action display and color
    const getActionDisplay = (action) => {
        switch(action) {
            case 'CREATE':
                return { text: 'Created', color: '#10b981' };
            case 'UPDATE':
                return { text: 'Updated', color: '#3b82f6' };
            case 'DELETE':
                return { text: 'Deleted', color: '#ef4444' };
            case 'STATUS_CHANGE':
                return { text: 'Status Changed', color: '#f59e0b' };
            default:
                return { text: action, color: '#64748b' };
        }
    };

    // Get entity name based on log data
    const getEntityName = (log) => {
        if (log.material && log.entity === 'MATERIAL') {
            return log.material.name;
        } else if (log.project && log.entity === 'PROJECT') {
            return log.project.name;
        } else if (log.task && log.entity === 'TASK') {
            return log.task.name;
        } else if (log.review && log.entity === 'MATERIAL_REVIEW') {
            return `Review ${log.review.id}`;
        }

        return `${log.entity} ${log.id}`;
    };

    // Get entity type display
    const getEntityTypeDisplay = (entityType) => {
        const option = entityOptions.find(opt => opt.value === entityType);
        return option ? option.label : entityType;
    };

    // Check if user is authorized
    if (user.mainRole !== 'PROJECT_MANAGER' && user.mainRole !== 'ADMIN') {
        return (
            <div className="logs-panel-container">
                <Card className="access-denied">
                    <div className="access-denied-icon">⚠️</div>
                    <h2>Access Denied</h2>
                    <p>You don't have permission to view the audit logs. This feature is available only for managers and administrators.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="logs-panel-container">
            <div className="logs-header">
                <h1>System Audit Logs</h1>
                <p className="logs-subtitle">
                    View and manage system activities. Some actions can be undone within a limited time window.
                </p>
            </div>

            <Card className="logs-filter-card">
                <div className="logs-filter-header">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search logs by description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="clear-search"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="filter-actions">
                        <Button
                            variant={isFilterExpanded ? 'primary' : 'outline'}
                            size="small"
                            icon={isFilterExpanded ? '🔽' : '🔍'}
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        >
                            Advanced Filters
                        </Button>

                        <Button
                            variant="outline"
                            size="small"
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </Button>

                        <Button
                            variant="primary"
                            size="small"
                            onClick={applyFilters}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>

                {isFilterExpanded && (
                    <div className="advanced-filters">
                        <div className="filter-section">
                            <h3>Date Range</h3>
                            <div className="date-filters">
                                <div className="date-input">
                                    <label>From:</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </div>
                                <div className="date-input">
                                    <label>To:</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3>Entity Type</h3>
                            <div className="filter-chips">
                                {entityOptions.map(option => (
                                    <div
                                        key={option.value}
                                        className={`filter-chip ${entityFilter.includes(option.value) ? 'selected' : ''}`}
                                        onClick={() => toggleEntityFilter(option.value)}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3>Action Type</h3>
                            <div className="filter-chips">
                                {actionOptions.map(option => (
                                    <div
                                        key={option.value}
                                        className={`filter-chip ${actionFilter.includes(option.value) ? 'selected' : ''}`}
                                        onClick={() => toggleActionFilter(option.value)}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {loading ? (
                <div className="loading-indicator">Loading audit logs...</div>
            ) : error ? (
                <div className="error-message">Error loading logs: {error.message}</div>
            ) : (
                <>
                    <div className="logs-table-wrapper">
                        <table className="logs-table">
                            <thead>
                            <tr>
                                <th className="timestamp-col">Timestamp</th>
                                <th className="user-col">User</th>
                                <th className="action-col">Action</th>
                                <th className="entity-col">Entity</th>
                                <th className="entity-name-col">Name</th>
                                <th className="description-col">Description</th>
                                <th className="actions-col">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data?.auditLogs?.content.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-logs-message">
                                        No logs found with the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                data?.auditLogs?.content.map(log => {
                                    const { text: actionText, color: actionColor } = getActionDisplay(log.action);

                                    return (
                                        <tr key={log.id} className={`log-row ${log.action.toLowerCase()}`}>
                                            <td className="timestamp-col">{formatTimestamp(log.timestamp)}</td>
                                            <td className="user-col">
                                                {log.worker ? `${log.worker.name} ${log.worker.surname}` : log.username}
                                                <div className="user-role">{log.role}</div>
                                            </td>
                                            <td className="action-col">
                                                <StatusBadge
                                                    status={actionText}
                                                    variant={log.action === 'CREATE' ? 'success' :
                                                        log.action === 'UPDATE' ? 'primary' :
                                                            log.action === 'DELETE' ? 'danger' : 'warning'}
                                                    size="small"
                                                />
                                            </td>
                                            <td className="entity-col">
                                                {getEntityTypeDisplay(log.entity)}
                                            </td>
                                            <td className="entity-name-col">
                                                {getEntityName(log)}
                                            </td>
                                            <td className="description-col">
                                                {log.description}
                                            </td>
                                            <td className="actions-col">
                                                {log.isUndoable ? (
                                                    <Button
                                                        variant="warning"
                                                        size="small"
                                                        icon="↩️"
                                                        onClick={() => setConfirmUndoLog(log)}
                                                        disabled={undoLoading}
                                                    >
                                                        Undo
                                                    </Button>
                                                ) : (
                                                    <span className="cannot-undo">Cannot undo</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>

                    {data?.auditLogs?.pageInfo?.totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={data.auditLogs.pageInfo.totalPages}
                            onPageChange={setPage}
                            pageSize={size}
                            onPageSizeChange={newSize => {
                                setSize(newSize);
                                setPage(1);
                            }}
                            totalItems={data.auditLogs.pageInfo.totalElements}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    )}
                </>
            )}

            {/* Confirmation Dialog for Undoing Actions */}
            <ConfirmationDialog
                isOpen={!!confirmUndoLog}
                onClose={() => setConfirmUndoLog(null)}
                onConfirm={handleConfirmUndo}
                title="Undo Action"
                message={`Are you sure you want to undo this action?\n\nAction: ${confirmUndoLog?.action}\nEntity: ${confirmUndoLog?.entity}\nDescription: ${confirmUndoLog?.description}\n\nThis operation may affect related data and cannot be reversed.`}
                confirmText="Undo Action"
                cancelText="Cancel"
                variant="warning"
            />
        </div>
    );
}