// src/pages/EmployeeManagement/EmployeeManagement.jsx
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Button from "../../components/common/Button/Button";
import ConfirmationDialog from "../../components/common/ConfirmationDialog/ConfirmationDialog";
import EmployeeForm from "./components/EmployeeForm/EmployeeForm";
import EmployeeList from "./components/EmployeeList/EmployeeList";
import AccountForm from "./components/AccountForm/AccountForm";
import OfficeManagement from "./components/OfficeManagement/OfficeManagement";
import FilterPanel from "./components/FilterPanel/FilterPanel";
import EmployeeDashboard from "./components/EmployeeDashboard/EmployeeDashboard";
import ClientManagement from "./components/ClientManagement/ClientManagement";
import "./EmployeeManagement.css";

/* ────────── GraphQL ────────────────────────────────────────────────── */
const GET_WORKERS = gql`
    query GetWorkers {
        workers {
            id
            name
            surname
            email
            phoneNumber
            isReviewer
            position {
                id
                name
            }
            office {
                id
                street
                city {
                    id
                    name
                    country {
                        id
                        name
                    }
                }
            }
        }
    }
`;

const GET_POSITIONS = gql`
    query GetPositions {
        positions {
            id
            name
        }
    }
`;

const GET_OFFICES = gql`
    query GetOffices {
        offices {
            id
            street
            city {
                id
                name
                country {
                    id
                    name
                }
            }
        }
    }
`;

const GET_WORKER_ACCOUNT = gql`
    query GetWorkerAccount($workerId: Int!) {
        workerAccountByWorkerId(workerId: $workerId) {
            id
            username
        }
    }
`;

const CREATE_WORKER = gql`
    mutation CreateWorker($input: CreateWorkerInput!) {
        createWorker(input: $input) {
            id
        }
    }
`;

const UPDATE_WORKER = gql`
    mutation UpdateWorker($id: ID!, $input: UpdateWorkerInput!) {
        updateWorker(id: $id, input: $input) {
            id
        }
    }
`;

const DELETE_WORKER = gql`
    mutation DeleteWorker($id: ID!) {
        deleteWorker(id: $id)
    }
`;

const CREATE_WORKER_ACCOUNT = gql`
    mutation CreateWorkerAccount($input: WorkerAccountInput!) {
        createWorkerAccount(input: $input) {
            id
            username
        }
    }
`;

const UPDATE_WORKER_ACCOUNT = gql`
    mutation UpdateWorkerAccountUsername($accountId: Int!, $newUsername: String!) {
        updateWorkerAccountUsername(accountId: $accountId, newUsername: $newUsername) {
            id
            username
        }
    }
`;

const DELETE_WORKER_ACCOUNT = gql`
    mutation DeleteWorkerAccount($accountId: Int!) {
        deleteWorkerAccount(accountId: $accountId)
    }
`;
/* ───────────────────────────────────────────────────────────────────── */

export default function EmployeeManagement() {
    /* ─── фільтри, сортування, вибрані сутності ─── */
    const [filters, setFilters] = useState({
        nameContains: "",
        positionIds: [],
        officeIds: [],
        isReviewer: null,
    });
    const [sortField, setSortField] = useState("surname");
    const [sortDirection, setSortDirection] = useState("ASC");

    const [activeTab, setActiveTab] = useState("employees");

    const [showEmployeeForm, setShowEmployeeForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [showAccountForm, setShowAccountForm] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

    /* ─── GraphQL запити ─── */
    const {
        data: workersData,
        loading: workersLoading,
        error: workersError,
        refetch: refetchWorkers,
    } = useQuery(GET_WORKERS);

    const { data: positionsData, error: positionsError } = useQuery(GET_POSITIONS);
    const { data: officesData, error: officesError } = useQuery(GET_OFFICES);

    const {
        data: accountData,
        error: accountError,
        refetch: refetchAccount,
    } = useQuery(GET_WORKER_ACCOUNT, {
        variables: { workerId: selectedEmployee?.id ? +selectedEmployee.id : 0 },
        skip: !selectedEmployee?.id,
    });

    /* ─── GraphQL мутації ─── */
    const [createWorker] = useMutation(CREATE_WORKER);
    const [updateWorker] = useMutation(UPDATE_WORKER);
    const [deleteWorker] = useMutation(DELETE_WORKER);

    const [createWorkerAccount] = useMutation(CREATE_WORKER_ACCOUNT);
    const [updateWorkerAccount] = useMutation(UPDATE_WORKER_ACCOUNT);
    const [deleteWorkerAccount] = useMutation(DELETE_WORKER_ACCOUNT);

    /* ─── Toast для помилок запитів ─── */
    useEffect(() => {
        if (workersError)  toast.error(`Помилка завантаження працівників: ${workersError.message}`);
        if (positionsError) toast.error(`Помилка завантаження посад: ${positionsError.message}`);
        if (officesError)   toast.error(`Помилка завантаження офісів: ${officesError.message}`);
        if (accountError)   toast.error(`Помилка завантаження облікового запису: ${accountError.message}`);
    }, [workersError, positionsError, officesError, accountError]);

    /* ─── обробка даних ─── */
    const workers = useMemo(() => {
        let list = workersData?.workers || [];

        if (filters.nameContains) {
            const q = filters.nameContains.toLowerCase();
            list = list.filter((w) => `${w.name} ${w.surname}`.toLowerCase().includes(q));
        }
        if (filters.positionIds?.length) {
            list = list.filter((w) => filters.positionIds.includes(w.position.id));
        }
        if (filters.officeIds?.length) {
            list = list.filter((w) => filters.officeIds.includes(w.office.id));
        }
        if (filters.isReviewer !== null) {
            list = list.filter((w) => w.isReviewer === filters.isReviewer);
        }

        return [...list].sort((a, b) => {
            const valA = a[sortField]?.toString().toLowerCase() || "";
            const valB = b[sortField]?.toString().toLowerCase() || "";
            return sortDirection === "ASC" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    }, [workersData, filters, sortField, sortDirection]);

    const positions = positionsData?.positions || [];
    const offices   = officesData?.offices   || [];
    const account   = accountData?.workerAccountByWorkerId;

    /* ─── Handlers ─── */
    const handleAddEmployee = () => {
        setSelectedEmployee(null);
        setShowEmployeeForm(true);
    };

    const handleEditEmployee = (emp) => {
        setSelectedEmployee(emp);
        setShowEmployeeForm(true);
    };

    const handleDeleteEmployee = (emp) => {
        setSelectedEmployee(emp);
        setShowDeleteConfirm(true);
    };

    const handleEmployeeFormSubmit = async (empData) => {
        const variables = {
            input: {
                name:        empData.name,
                surname:     empData.surname,
                email:       empData.email,
                phoneNumber: empData.phoneNumber,
                positionId:  +empData.positionId,
                officeId:    +empData.officeId,
                isReviewer:  empData.isReviewer,
            },
        };
        try {
            if (empData.id) {
                await updateWorker({ variables: { id: empData.id, ...variables } });
                toast.success("Працівника успішно оновлено");
            } else {
                await createWorker({ variables });
                toast.success("Працівника успішно створено");
            }
            setShowEmployeeForm(false);
            refetchWorkers();
        } catch (e) {
            const msg = e?.graphQLErrors?.[0]?.message || e.message;
            toast.error(`Не вдалося зберегти працівника: ${msg}`);
        }
    };

    const handleDeleteEmployeeConfirm = async () => {
        const deletedEmployee = selectedEmployee; // зберігаємо до очищення
        setShowDeleteConfirm(false);              // спершу закриваємо діалог
        try {
            await deleteWorker({ variables: { id: deletedEmployee.id } });
            toast.success(`Працівника ${deletedEmployee.name} ${deletedEmployee.surname} видалено`);
            refetchWorkers();
        } catch (e) {
            const message = e?.graphQLErrors?.[0]?.message || e.message || "Невідома помилка";
            setTimeout(() => toast.error(message), 0);
        } finally {
            setSelectedEmployee(null);
        }
    };


    const handleManageAccount = (emp) => {
        setSelectedEmployee(emp);
        refetchAccount();
        setShowAccountForm(true);
    };

    const handleAccountFormSubmit = async (accData) => {
        try {
            if (accData.id) {
                await updateWorkerAccount({
                    variables: { accountId: +accData.id, newUsername: accData.username },
                });
                toast.success("Ім’я користувача змінено");
            } else {
                await createWorkerAccount({
                    variables: {
                        input: {
                            workerId: +selectedEmployee.id,
                            username: accData.username,
                            password: accData.password,
                        },
                    },
                });
                toast.success("Обліковий запис створено");
            }
            setShowAccountForm(false);
            refetchAccount();
        } catch (e) {
            toast.error(e?.graphQLErrors?.[0]?.message || e.message);
        }
    };

    const handleDeleteAccountConfirm = async () => {
        try {
            await deleteWorkerAccount({ variables: { accountId: +selectedAccount.id } });
            toast.success("Обліковий запис видалено");
            setShowDeleteAccountConfirm(false);
            refetchAccount();
        } catch (e) {
            toast.error(e?.graphQLErrors?.[0]?.message || e.message);
        }
    };

    const handleSortChange = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
        } else {
            setSortField(field);
            setSortDirection("ASC");
        }
    };

    /* ─── UI ─── */
    return (
        <div className="employee-management-container">


            <header className="page-header">
                <h1>Управління кадрами</h1>
                <div className="tab-buttons">
                    <button
                        className={`tab-btn ${activeTab === "employees" ? "active" : ""}`}
                        onClick={() => setActiveTab("employees")}
                    >
                        Працівники
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "clients" ? "active" : ""}`}
                        onClick={() => setActiveTab("clients")}
                    >
                        Клієнти
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        Статистика
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "offices" ? "active" : ""}`}
                        onClick={() => setActiveTab("offices")}
                    >
                        Офіси
                    </button>
                </div>
            </header>

            {activeTab === "employees" && (
                <>
                    <div className="actions-bar">
                        <Button variant="primary" size="small" onClick={handleAddEmployee} icon="➕">
                            Додати працівника
                        </Button>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => {
                                refetchWorkers();
                                toast.info("Дані оновлено", {
                                    autoClose: 1000
                                });
                            }}
                        >
                            Оновити
                        </Button>
                    </div>

                    <FilterPanel
                        positions={positions}
                        offices={offices}
                        filters={filters}
                        onFilterChange={setFilters}
                    />

                    <EmployeeList
                        employees={workers}
                        onEdit={handleEditEmployee}
                        onDelete={handleDeleteEmployee}
                        onManageAccount={handleManageAccount}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSortChange={handleSortChange}
                        loading={workersLoading}
                    />
                </>
            )}

            {activeTab === "clients" && <ClientManagement />}
            {activeTab === "dashboard" && <EmployeeDashboard />}
            {activeTab === "offices" && <OfficeManagement />}

            {/* ── Модальні форми / діалоги ── */}
            {showEmployeeForm && (
                <EmployeeForm
                    isOpen={showEmployeeForm}
                    onClose={() => setShowEmployeeForm(false)}
                    onSave={handleEmployeeFormSubmit}
                    employee={selectedEmployee}
                    positions={positions}
                    offices={offices}
                />
            )}

            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteEmployeeConfirm}
                title="Видалення працівника"
                message={`Ви впевнені, що хочете видалити працівника ${selectedEmployee?.name} ${selectedEmployee?.surname}?`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />

            {showAccountForm && (
                <AccountForm
                    isOpen={showAccountForm}
                    onClose={() => setShowAccountForm(false)}
                    onSave={handleAccountFormSubmit}
                    account={account}
                    employee={selectedEmployee}
                    onDeleteAccount={() => {
                        setSelectedAccount(account);
                        setShowDeleteAccountConfirm(true);
                    }}
                />
            )}

            <ConfirmationDialog
                isOpen={showDeleteAccountConfirm}
                onClose={() => setShowDeleteAccountConfirm(false)}
                onConfirm={handleDeleteAccountConfirm}
                title="Видалення облікового запису"
                message={`Ви впевнені, що хочете видалити обліковий запис для працівника ${selectedEmployee?.name} ${selectedEmployee?.surname}?`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />
        </div>
    );
}
