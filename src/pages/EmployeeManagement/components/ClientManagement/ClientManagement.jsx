// src/pages/EmployeeManagement/components/ClientManagement/ClientManagement.jsx
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import ConfirmationDialog from "../../../../components/common/ConfirmationDialog/ConfirmationDialog";
import ClientModal from "../ClientModal/ClientModal";
import ClientFilterPanel from "./ClientFilterPanel";
import ClientList from "./ClientList";
import "./ClientManagement.css";

// === GraphQL queries & mutations ============================================
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

// === Компонент ==============================================================

export default function ClientManagement() {
    // ── State ────────────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery]       = useState("");
    const [sortField, setSortField]           = useState("name");
    const [sortDirection, setSortDirection]   = useState("ASC");
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [filters, setFilters]               = useState({});

    // ── GraphQL ───────────────────────────────────────────────────────────────
    const { data, loading, error, refetch }   = useQuery(GET_CLIENTS);
    const [deleteClient] = useMutation(DELETE_CLIENT);

    // Показуємо toast при помилці запиту
    useEffect(() => {
        if (error) {
            toast.error(`Помилка завантаження клієнтів: ${error.message}`);
        }
    }, [error]);

    // ── Memo: фільтрація й сортування ─────────────────────────────────────────
    const clients = useMemo(() => {
        let list = data?.clients || [];

        // Пошук
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                (c.email && c.email.toLowerCase().includes(q))
            );
        }

        // (майбутні фільтри)
        // ... filters ...

        // Сортування
        return [...list].sort((a, b) => {
            const parts = sortField.split(".");
            let valA = a, valB = b;
            for (const p of parts) {
                valA = valA?.[p];
                valB = valB?.[p];
            }
            valA = valA?.toString().toLowerCase() || "";
            valB = valB?.toString().toLowerCase() || "";

            return sortDirection === "ASC"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });
    }, [data, searchQuery, sortField, sortDirection, filters]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleAddClient = () => {
        setSelectedClient(null);
        setShowClientModal(true);
    };

    const handleEditClient = client => {
        setSelectedClient(client);
        setShowClientModal(true);
    };

    const handleDeleteClient = client => {
        setSelectedClient(client);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteClient({ variables: { id: selectedClient.id } });
            toast.success("Клієнта успішно видалено");
            setShowDeleteConfirm(false);
            refetch();
        } catch (e) {
            const msg =
                e?.graphQLErrors?.[0]?.message ||
                e?.networkError?.message ||
                e.message;
            toast.error(`Не вдалося видалити клієнта: ${msg}`);
        }
    };

    const handleClientSaved = () => {
        setShowClientModal(false);
        toast.success("Клієнта успішно збережено");
        refetch();
    };

    const handleSortChange = field => {
        if (sortField === field) {
            setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
        } else {
            setSortField(field);
            setSortDirection("ASC");
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="client-management-container">
            {/* Toast контейнер (один раз у межах сторінки/додатка) */}
            <ToastContainer position="top-right" autoClose={4000} />

            <div className="actions-bar">
                <Button variant="primary" size="small" onClick={handleAddClient} icon="➕">
                    Додати клієнта
                </Button>
                <Button variant="outline" size="small" onClick={() => { refetch(); toast.info("Дані оновлено"); }}>
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
