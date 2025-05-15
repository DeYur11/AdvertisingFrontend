import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Alert,
    Tabs,
    Tab,
    Badge,
    Card,
    Container,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import moment from 'moment';

// GraphQL queries
const GET_ROLLBACK_CANDIDATES = gql`
    query GetRollbackCandidates($entityType: String!, $entityId: Int!) {
        getRollbackCandidates(entityType: $entityType, entityId: $entityId) {
            id
            entityType
            entityId
            action
            workerId
            username
            timestamp
            description
            rolledBack
            previousState
            currentState
        }
    }
`;

const GET_TRANSACTION_HISTORY = gql`
    query GetTransactionHistory($input: TransactionHistoryInput!) {
        getTransactionHistory(input: $input) {
            id
            entityType
            entityId
            action
            workerId
            username
            timestamp
            description
            rolledBack
            previousState
            currentState
        }
    }
`;

const ROLLBACK_TRANSACTION = gql`
    mutation RollbackTransaction($input: RollbackInput!) {
        rollbackTransaction(input: $input) {
            success
            message
            transactionId
        }
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

const TransactionHistoryPanel = ({ entityType, entityId, projectId, onRollbackSuccess }) => {
    const [activeTab, setActiveTab] = useState('history');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [restoreModalVisible, setRestoreModalVisible] = useState(false);
    const [selectedTimestamp, setSelectedTimestamp] = useState(null);
    const [alertInfo, setAlertInfo] = useState({ visible: false, message: '', variant: 'info' });

    // Query for rollback candidates
    const {
        loading: rollbacksLoading,
        error: rollbacksError,
        data: rollbacksData,
        refetch: refetchRollbacks
    } = useQuery(GET_ROLLBACK_CANDIDATES, {
        variables: { entityType, entityId },
        skip: !entityId || activeTab !== 'rollback'
    });

    // Query for transaction history
    const {
        loading: historyLoading,
        error: historyError,
        data: historyData,
        refetch: refetchHistory
    } = useQuery(GET_TRANSACTION_HISTORY, {
        variables: {
            input: {
                entityType,
                entityId,
                projectId,
                limit: 100
            }
        },
        skip: (!entityId && !projectId) || activeTab !== 'history'
    });

    // Mutation for rollback
    const [rollbackTransaction, { loading: rollbackLoading }] = useMutation(ROLLBACK_TRANSACTION, {
        onCompleted: (data) => {
            if (data.rollbackTransaction.success) {
                setAlertInfo({
                    visible: true,
                    message: 'Rollback successful: ' + data.rollbackTransaction.message,
                    variant: 'success'
                });
                refetchRollbacks();
                refetchHistory();
                if (onRollbackSuccess) onRollbackSuccess();
            } else {
                setAlertInfo({
                    visible: true,
                    message: 'Rollback failed: ' + data.rollbackTransaction.message,
                    variant: 'danger'
                });
            }
            setModalVisible(false);
        },
        onError: (error) => {
            setAlertInfo({
                visible: true,
                message: 'Error performing rollback: ' + error.message,
                variant: 'danger'
            });
            setModalVisible(false);
        }
    });

    // Mutation for restore to point
    const [restoreEntityToPoint, { loading: restoreLoading }] = useMutation(RESTORE_ENTITY_TO_POINT, {
        onCompleted: (data) => {
            if (data.restoreEntityToPoint.success) {
                setAlertInfo({
                    visible: true,
                    message: 'Restore successful: ' + data.restoreEntityToPoint.message,
                    variant: 'success'
                });
                refetchRollbacks();
                refetchHistory();
                if (onRollbackSuccess) onRollbackSuccess();
            } else {
                setAlertInfo({
                    visible: true,
                    message: 'Restore failed: ' + data.restoreEntityToPoint.message,
                    variant: 'danger'
                });
            }
            setRestoreModalVisible(false);
        },
        onError: (error) => {
            setAlertInfo({
                visible: true,
                message: 'Error performing restore: ' + error.message,
                variant: 'danger'
            });
            setRestoreModalVisible(false);
        }
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (alertInfo.visible) {
                setAlertInfo({ ...alertInfo, visible: false });
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [alertInfo]);

    const handleRollbackClick = (transaction) => {
        setSelectedTransaction(transaction);
        setModalVisible(true);
    };

    const handleRestoreClick = (timestamp) => {
        setSelectedTimestamp(timestamp);
        setRestoreModalVisible(true);
    };

    const confirmRollback = () => {
        rollbackTransaction({
            variables: {
                input: {
                    transactionId: selectedTransaction.id
                }
            }
        });
    };

    const confirmRestore = () => {
        restoreEntityToPoint({
            variables: {
                entityType,
                entityId,
                timestamp: selectedTimestamp
            }
        });
    };

    const formatTimestamp = (timestamp) => {
        return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
    };

    const getActionBadge = (action) => {
        switch (action) {
            case 'CREATE':
                return <Badge bg="success">Create</Badge>;
            case 'UPDATE':
                return <Badge bg="warning">Update</Badge>;
            case 'DELETE':
                return <Badge bg="danger">Delete</Badge>;
            default:
                return <Badge bg="secondary">{action}</Badge>;
        }
    };

    const renderHistoryTab = () => {
        if (historyError) return <Alert variant="danger">Error loading transaction history: {historyError.message}</Alert>;

        const transactions = historyData?.getTransactionHistory || [];

        if (transactions.length === 0) {
            return <Alert variant="info">No transaction history found for this entity.</Alert>;
        }

        return (
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map(tx => (
                    <tr key={tx.id} className={tx.rolledBack ? 'text-muted bg-light' : ''}>
                        <td>{formatTimestamp(tx.timestamp)}</td>
                        <td>{getActionBadge(tx.action)}</td>
                        <td>{tx.description || `${tx.entityType} #${tx.entityId}`}</td>
                        <td>{tx.username}</td>
                        <td>
                            {tx.rolledBack ?
                                <Badge bg="secondary">Rolled Back</Badge> :
                                <Badge bg="success">Active</Badge>
                            }
                        </td>
                        <td>
                            {!tx.rolledBack && tx.previousState && (
                                <Button
                                    size="sm"
                                    variant="outline-warning"
                                    onClick={() => handleRollbackClick(tx)}
                                    disabled={rollbackLoading}
                                >
                                    Rollback
                                </Button>
                            )}
                            {!tx.rolledBack && (
                                <Button
                                    size="sm"
                                    variant="outline-info"
                                    className="ms-1"
                                    onClick={() => handleRestoreClick(tx.timestamp)}
                                    disabled={restoreLoading}
                                >
                                    Restore to Here
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        );
    };

    const renderRollbackTab = () => {
        if (rollbacksError) return <Alert variant="danger">Error loading rollback candidates: {rollbacksError.message}</Alert>;

        const transactions = rollbacksData?.getRollbackCandidates || [];

        if (transactions.length === 0) {
            return <Alert variant="info">No rollback candidates available for this entity.</Alert>;
        }

        return (
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>User</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map(tx => (
                    <tr key={tx.id}>
                        <td>{formatTimestamp(tx.timestamp)}</td>
                        <td>{getActionBadge(tx.action)}</td>
                        <td>{tx.description || `${tx.entityType} #${tx.entityId}`}</td>
                        <td>{tx.username}</td>
                        <td>
                            <Button
                                size="sm"
                                variant="warning"
                                onClick={() => handleRollbackClick(tx)}
                                disabled={rollbackLoading}
                            >
                                Rollback
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        );
    };

    return (
        <Container fluid>
            {alertInfo.visible && (
                <Alert
                    variant={alertInfo.variant}
                    onClose={() => setAlertInfo({...alertInfo, visible: false})}
                    dismissible
                >
                    {alertInfo.message}
                </Alert>
            )}

            <Card className="shadow-sm mb-4">
                <Card.Header>
                    <h5 className="mb-0">Transaction History</h5>
                </Card.Header>
                <Card.Body>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(key) => setActiveTab(key)}
                        className="mb-3"
                    >
                        <Tab eventKey="history" title="Transaction History">
                            {renderHistoryTab()}
                        </Tab>
                        <Tab eventKey="rollback" title="Rollback Options">
                            {renderRollbackTab()}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>

            {/* Rollback Confirmation Modal */}
            <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Rollback</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to rollback this transaction?</p>
                    {selectedTransaction && (
                        <div>
                            <p><strong>Action:</strong> {selectedTransaction.action}</p>
                            <p><strong>Time:</strong> {formatTimestamp(selectedTransaction.timestamp)}</p>
                            <p><strong>Description:</strong> {selectedTransaction.description || `${selectedTransaction.entityType} #${selectedTransaction.entityId}`}</p>
                            <Alert variant="warning">
                                This action will revert the entity to its previous state and cannot be undone!
                            </Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalVisible(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="warning"
                        onClick={confirmRollback}
                        disabled={rollbackLoading}
                    >
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Restore Confirmation Modal */}
            <Modal show={restoreModalVisible} onHide={() => setRestoreModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Restore to Point in Time</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to restore this entity to this point in time?</p>
                    {selectedTimestamp && (
                        <div>
                            <p><strong>Time:</strong> {formatTimestamp(selectedTimestamp)}</p>
                            <Alert variant="warning">
                                This action will roll back all transactions made after this point and cannot be undone!
                            </Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setRestoreModalVisible(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="warning"
                        onClick={confirmRestore}
                        disabled={restoreLoading}
                    >
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TransactionHistoryPanel;