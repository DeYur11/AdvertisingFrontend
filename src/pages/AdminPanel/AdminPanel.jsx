import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import Modal from '../../components/common/Modal/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog/ConfirmationDialog';
import ClientsTable from './components/ClientsTable/ClientsTable';
import ClientModal from '../ProjectManagement/components/ClientModal/ClientModal';
import MaterialClassifiersTable from './components/MaterialClassifiersTable';
import MaterialClassifierModal from './components/MaterialClassifierModal';
import './AdminPanel.css';

// GraphQL запити
const GET_CLIENTS = gql`
    query GetAllClients {
        clients {
            id
            name
            email
            phoneNumber
        }
    }
`;

const DELETE_CLIENT = gql`
    mutation DeleteClient($id: ID!) {
        deleteClient(id: $id)
    }
`;

const GET_MATERIAL_CLASSIFIERS = gql`
    query GetMaterialClassifiers {
        materialClassifiers {
            id
            name
            description
            parentId
            parent {
                id
                name
            }
        }
    }
`;

const DELETE_MATERIAL_CLASSIFIER = gql`
    mutation DeleteMaterialClassifier($id: ID!) {
        deleteMaterialClassifier(id: $id)
    }
`;

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('clients');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isDeleteClientConfirmOpen, setIsDeleteClientConfirmOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);

    const [selectedClassifier, setSelectedClassifier] = useState(null);
    const [isClassifierModalOpen, setIsClassifierModalOpen] = useState(false);
    const [isDeleteClassifierConfirmOpen, setIsDeleteClassifierConfirmOpen] = useState(false);
    const [classifierToDelete, setClassifierToDelete] = useState(null);

    // Запити для клієнтів
    const {
        data: clientsData,
        loading: clientsLoading,
        error: clientsError,
        refetch: refetchClients
    } = useQuery(GET_CLIENTS);

    const [deleteClient] = useMutation(DELETE_CLIENT, {
        onCompleted: () => {
            refetchClients();
        }
    });

    // Запити для класифікаторів матеріалів
    const {
        data: classifiersData,
        loading: classifiersLoading,
        error: classifiersError,
        refetch: refetchClassifiers
    } = useQuery(GET_MATERIAL_CLASSIFIERS);

    const [deleteMaterialClassifier] = useMutation(DELETE_MATERIAL_CLASSIFIER, {
        onCompleted: () => {
            refetchClassifiers();
        }
    });

    // Функції для керування клієнтами
    const handleAddClient = () => {
        setSelectedClient(null);
        setIsClientModalOpen(true);
    };

    const handleEditClient = (client) => {
        setSelectedClient(client);
        setIsClientModalOpen(true);
    };

    const handleDeleteClient = (client) => {
        setClientToDelete(client);
        setIsDeleteClientConfirmOpen(true);
    };

    const confirmDeleteClient = async () => {
        if (clientToDelete) {
            try {
                await deleteClient({ variables: { id: clientToDelete.id } });
            } catch (error) {
                console.error('Error deleting client:', error);
            }
        }
        setIsDeleteClientConfirmOpen(false);
        setClientToDelete(null);
    };

    const handleClientModalClose = () => {
        setIsClientModalOpen(false);
        setSelectedClient(null);
    };

    const handleClientSaved = () => {
        refetchClients();
        setIsClientModalOpen(false);
        setSelectedClient(null);
    };

    // Функції для керування класифікаторами матеріалів
    const handleAddClassifier = () => {
        setSelectedClassifier(null);
        setIsClassifierModalOpen(true);
    };

    const handleEditClassifier = (classifier) => {
        setSelectedClassifier(classifier);
        setIsClassifierModalOpen(true);
    };

    const handleDeleteClassifier = (classifier) => {
        setClassifierToDelete(classifier);
        setIsDeleteClassifierConfirmOpen(true);
    };

    const confirmDeleteClassifier = async () => {
        if (classifierToDelete) {
            try {
                await deleteMaterialClassifier({ variables: { id: classifierToDelete.id } });
            } catch (error) {
                console.error('Error deleting material classifier:', error);
            }
        }
        setIsDeleteClassifierConfirmOpen(false);
        setClassifierToDelete(null);
    };

    const handleClassifierModalClose = () => {
        setIsClassifierModalOpen(false);
        setSelectedClassifier(null);
    };

    const handleClassifierSaved = () => {
        refetchClassifiers();
        setIsClassifierModalOpen(false);
        setSelectedClassifier(null);
    };

    return (
        <div className="admin-panel-container">
            <header className="admin-panel-header">
                <h1>Адміністративна панель</h1>
                <p>Управління клієнтами та класифікаторами матеріалів</p>
            </header>

            <Card className="admin-panel-card">
                <div className="admin-tabs">
                    <button
                        className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`}
                        onClick={() => setActiveTab('clients')}
                    >
                        Клієнти
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'classifiers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('classifiers')}
                    >
                        Класифікатори матеріалів
                    </button>
                </div>

                {activeTab === 'clients' && (
                    <div className="tab-panel">
                        <div className="tab-header">
                            <h2>Управління клієнтами</h2>
                            <Button
                                variant="primary"
                                size="small"
                                icon="➕"
                                onClick={handleAddClient}
                            >
                                Додати клієнта
                            </Button>
                        </div>

                        {clientsLoading ? (
                            <div className="loading-message">Завантаження клієнтів...</div>
                        ) : clientsError ? (
                            <div className="error-message">Помилка: {clientsError.message}</div>
                        ) : (
                            <ClientsTable
                                clients={clientsData?.clients || []}
                                onEdit={handleEditClient}
                                onDelete={handleDeleteClient}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'classifiers' && (
                    <div className="tab-panel">
                        <div className="tab-header">
                            <h2>Управління класифікаторами матеріалів</h2>
                            <Button
                                variant="primary"
                                size="small"
                                icon="➕"
                                onClick={handleAddClassifier}
                            >
                                Додати класифікатор
                            </Button>
                        </div>

                        {classifiersLoading ? (
                            <div className="loading-message">Завантаження класифікаторів...</div>
                        ) : classifiersError ? (
                            <div className="error-message">Помилка: {classifiersError.message}</div>
                        ) : (
                            <MaterialClassifiersTable
                                classifiers={classifiersData?.materialClassifiers || []}
                                onEdit={handleEditClassifier}
                                onDelete={handleDeleteClassifier}
                            />
                        )}
                    </div>
                )}
            </Card>

            {/* Модальні вікна для клієнтів */}
            {isClientModalOpen && (
                <ClientModal
                    client={selectedClient}
                    editMode={!!selectedClient}
                    onSave={handleClientSaved}
                    onCancel={handleClientModalClose}
                />
            )}

            <ConfirmationDialog
                isOpen={isDeleteClientConfirmOpen}
                onClose={() => setIsDeleteClientConfirmOpen(false)}
                onConfirm={confirmDeleteClient}
                title="Видалення клієнта"
                message={`Ви впевнені, що хочете видалити клієнта "${clientToDelete?.name}"?`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />

            {/* Модальні вікна для класифікаторів */}
            {isClassifierModalOpen && (
                <MaterialClassifierModal
                    classifier={selectedClassifier}
                    parentOptions={classifiersData?.materialClassifiers || []}
                    editMode={!!selectedClassifier}
                    onSave={handleClassifierSaved}
                    onCancel={handleClassifierModalClose}
                />
            )}

            <ConfirmationDialog
                isOpen={isDeleteClassifierConfirmOpen}
                onClose={() => setIsDeleteClassifierConfirmOpen(false)}
                onConfirm={confirmDeleteClassifier}
                title="Видалення класифікатора"
                message={`Ви впевнені, що хочете видалити класифікатор "${classifierToDelete?.name}"?`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />
        </div>
    );
}