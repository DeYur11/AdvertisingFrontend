// src/pages/EmployeeManagement/components/ClientManagement/ClientManagement.jsx
import { useState, useMemo } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import ConfirmationDialog from "../../../../components/common/ConfirmationDialog/ConfirmationDialog";
import ClientModal from "../ClientModal/ClientModal";
import ClientFilterPanel from "./ClientFilterPanel";
import ClientList from "./ClientList";
import "./ClientManagement.css";

// GraphQL queries
const GET_CLIENTS = gql`
    query GetClients {
        clients {
            id
            name
            email
            phoneNumber
            createDatetime
            updateDatetime
        }
    }
`;

const DELETE_CLIENT = gql`
    mutation DeleteClient($id: ID!) {
        deleteClient(id: $id)
    }
`;

export default function ClientManagement() {
    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("ASC");
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [filters, setFilters] = useState({});

    // Queries and mutations
    const { data, loading, error, refetch } = useQuery(GET_CLIENTS);
    const [deleteClient] = useMutation(DELETE_CLIENT);

    // Filtered and sorted clients
    const clients = useMemo(() => {
        let list = data?.clients || [];

        // Apply search filter
        if (searchQuery) {
            list = list.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Sort the list
        return [...list].sort((a, b) => {
            // Handle nested fields like city.name or city.country.name
            const fieldParts = sortField.split('.');
            let valA = a;
            let valB = b;

            for (const part of fieldParts) {
                valA = valA?.[part];
                valB = valB?.[part];
            }

            // Convert to strings for comparison
            valA = valA?.toString().toLowerCase() || "";
            valB = valB?.toString().toLowerCase() || "";

            return sortDirection === "ASC"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });
    }, [data, searchQuery, sortField, sortDirection, filters]);

    // Handlers
    const handleAddClient = () => {
        setSelectedClient(null);
        setShowClientModal(true);
    };

    const handleEditClient = (client) => {
        setSelectedClient(client);
        setShowClientModal(true);
    };

    const handleDeleteClient = (client) => {
        setSelectedClient(client);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteClient({ variables: { id: selectedClient.id } });
            setShowDeleteConfirm(false);
            refetch();
        } catch (error) {
            console.error("Error deleting client:", error);
        }
    };

    const handleClientSaved = () => {
        setShowClientModal(false);
        refetch();
    };

    const handleSortChange = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
        } else {
            setSortField(field);
            setSortDirection("ASC");
        }
    };

    return (
        <div className="client-management-container">
            <div className="actions-bar">
                <Button
                    variant="primary"
                    size="small"
                    onClick={handleAddClient}
                    icon="➕"
                >
                    Додати клієнта
                </Button>
                <Button
                    variant="outline"
                    size="small"
                    onClick={refetch}
                >
                    Оновити
                </Button>
            </div>

            <ClientFilterPanel
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
            />

            {loading && <div className="loading-indicator">Завантаження клієнтів...</div>}
            {error && <div className="error-message">Помилка: {error.message}</div>}

            {!loading && !error && (
                <ClientList
                    clients={clients}
                    onEdit={handleEditClient}
                    onDelete={handleDeleteClient}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                />
            )}

            {showClientModal && (
                <ClientModal
                    client={selectedClient}
                    editMode={!!selectedClient}
                    onClose={() => setShowClientModal(false)}
                    onSave={handleClientSaved}
                />
            )}

            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteConfirm}
                title="Видалення клієнта"
                message={`Ви впевнені, що хочете видалити клієнта "${selectedClient?.name}"?`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />
        </div>
    );
}