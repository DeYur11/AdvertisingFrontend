// src/pages/EmployeeManagement/EmployeeManagement.jsx - Updated to include WorkerTasks
import { useState, useMemo } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Button from "../../components/common/Button/Button";
import ConfirmationDialog from "../../components/common/ConfirmationDialog/ConfirmationDialog";
import EmployeeForm from "./components/EmployeeForm/EmployeeForm";
import EmployeeList from "./components/EmployeeList/EmployeeList";
import AccountForm from "./components/AccountForm/AccountForm";
import OfficeManagement from "./components/OfficeManagement/OfficeManagement";
import FilterPanel from "./components/FilterPanel/FilterPanel";
import EmployeeDashboard from "./components/EmployeeDashboard/EmployeeDashboard"; // Import the new component
import "./EmployeeManagement.css";
//TODO Зробити відображення позиції працівника коли призначаєш його

// GraphQL queries and mutations remain the same...
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

export default function EmployeeManagement() {
    const [filters, setFilters] = useState({
        nameContains: "",
        positionIds: [],
        officeIds: [],
        isReviewer: null
    });
    const [sortField, setSortField] = useState("surname");
    const [sortDirection, setSortDirection] = useState("ASC");

    // Update tabs to include dashboard
    const [activeTab, setActiveTab] = useState('employees');
    const [showEmployeeForm, setShowEmployeeForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

    const { data: workersData, refetch: refetchWorkers } = useQuery(GET_WORKERS);
    const { data: positionsData } = useQuery(GET_POSITIONS);
    const { data: officesData } = useQuery(GET_OFFICES);
    const { data: accountData, refetch: refetchAccount } = useQuery(GET_WORKER_ACCOUNT, {
        variables: { workerId: selectedEmployee?.id ? parseInt(selectedEmployee.id) : 0 },
        skip: !selectedEmployee?.id
    });

    const [createWorker] = useMutation(CREATE_WORKER);
    const [updateWorker] = useMutation(UPDATE_WORKER);
    const [deleteWorker] = useMutation(DELETE_WORKER);
    const [createWorkerAccount] = useMutation(CREATE_WORKER_ACCOUNT);
    const [updateWorkerAccount] = useMutation(UPDATE_WORKER_ACCOUNT);
    const [deleteWorkerAccount] = useMutation(DELETE_WORKER_ACCOUNT);

    const workers = useMemo(() => {
        let list = workersData?.workers || [];

        if (filters.nameContains) {
            list = list.filter(w =>
                `${w.name} ${w.surname}`.toLowerCase().includes(filters.nameContains.toLowerCase())
            );
        }

        if (filters.positionIds?.length) {
            list = list.filter(w => filters.positionIds.includes(w.position.id));
        }

        if (filters.officeIds?.length) {
            list = list.filter(w => filters.officeIds.includes(w.office.id));
        }

        if (filters.isReviewer !== null) {
            list = list.filter(w => w.isReviewer === filters.isReviewer);
        }

        return [...list].sort((a, b) => {
            const valA = a[sortField]?.toString().toLowerCase() || "";
            const valB = b[sortField]?.toString().toLowerCase() || "";
            return sortDirection === "ASC" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    }, [workersData, filters, sortField, sortDirection]);

    const positions = positionsData?.positions || [];
    const offices = officesData?.offices || [];
    const account = accountData?.workerAccountByWorkerId;

    // The rest of the handlers remain the same...
    const handleAddEmployee = () => {
        setSelectedEmployee(null);
        setShowEmployeeForm(true);
    };

    const handleEditEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeForm(true);
    };

    const handleDeleteEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowDeleteConfirm(true);
    };

    const handleEmployeeFormSubmit = async (employeeData) => {
        try {
            const variables = {
                input: {
                    name: employeeData.name,
                    surname: employeeData.surname,
                    email: employeeData.email,
                    phoneNumber: employeeData.phoneNumber,
                    positionId: parseInt(employeeData.positionId),
                    officeId: parseInt(employeeData.officeId),
                    isReviewer: employeeData.isReviewer
                }
            };

            if (employeeData.id) {
                await updateWorker({ variables: { id: employeeData.id, ...variables } });
            } else {
                await createWorker({ variables });
            }

            setShowEmployeeForm(false);
            refetchWorkers();
        } catch (error) {
            console.error("Error saving employee:", error);
        }
    };

    const handleDeleteEmployeeConfirm = async () => {
        try {
            await deleteWorker({ variables: { id: selectedEmployee.id } });
            setShowDeleteConfirm(false);
            refetchWorkers();
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

    const handleManageAccount = (employee) => {
        setSelectedEmployee(employee);
        refetchAccount();
        setShowAccountForm(true);
    };

    const handleAccountFormSubmit = async (accountData) => {
        try {
            if (accountData.id) {
                await updateWorkerAccount({
                    variables: {
                        accountId: parseInt(accountData.id),
                        newUsername: accountData.username
                    }
                });
            } else {
                await createWorkerAccount({
                    variables: {
                        input: {
                            workerId: parseInt(selectedEmployee.id),
                            username: accountData.username,
                            password: accountData.password
                        }
                    }
                });
            }

            setShowAccountForm(false);
            refetchAccount();
        } catch (error) {
            console.error("Error saving account:", error);
        }
    };

    const handleDeleteAccountConfirm = async () => {
        try {
            await deleteWorkerAccount({ variables: { accountId: parseInt(selectedAccount.id) } });
            setShowDeleteAccountConfirm(false);
            refetchAccount();
        } catch (error) {
            console.error("Error deleting account:", error);
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

    return (
        <div className="employee-management-container">
            <header className="page-header">
                <h1>Employee Management</h1>
                <div className="tab-buttons">
                    <button
                        className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
                        onClick={() => setActiveTab('employees')}
                    >
                        Employees
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'offices' ? 'active' : ''}`}
                        onClick={() => setActiveTab('offices')}
                    >
                        Offices & Locations
                    </button>
                </div>
            </header>

            {activeTab === 'employees' && (
                <>
                    <div className="actions-bar">
                        <Button variant="primary" size="small" onClick={handleAddEmployee} icon="➕">
                            Add Employee
                        </Button>
                        <Button variant="outline" size="small" onClick={refetchWorkers}>
                            Refresh
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
                    />
                </>
            )}

            {activeTab === 'dashboard' && (
                <EmployeeDashboard />
            )}

            {activeTab === 'offices' && (
                <OfficeManagement />
            )}

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
                title="Delete Employee"
                message={`Are you sure you want to delete ${selectedEmployee?.name} ${selectedEmployee?.surname}?`}
                confirmText="Delete"
                cancelText="Cancel"
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
                title="Delete Account"
                message={`Are you sure you want to delete the account for ${selectedEmployee?.name} ${selectedEmployee?.surname}?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}