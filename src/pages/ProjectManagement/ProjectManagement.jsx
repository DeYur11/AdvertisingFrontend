// ==== ProjectManagement.jsx ====

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

import { GET_PAGINATED_PROJECTS_WITH_TOTAL } from "./graphql/projectsPagination.gql";
import "./ProjectManagement.css";
import ProjectCard from "./components/ProjectCard/ProjectCard";
import ProjectFilterPanel from "./components/ProjectFilterPanel/ProjectFilterPanel";
import Pagination from "../../components/common/Pagination/Pagination";
import Button from "../../components/common/Button/Button";
import AddProjectModal from "./components/AddProjectModal";
import EditProjectModal from "./components/EditProjectModal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog/ConfirmationDialog";
import PaymentModal from "./components/PaymentModal/PaymentModal";
import {DELETE_PAYMENT, GET_PAYMENT_PURPOSES} from "./graphql/projects.gql";

const DELETE_PROJECT = gql`
    mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
    }
`;

export default function ProjectManagement() {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentToEdit, setPaymentToEdit] = useState(null);
    const [paymentProject, setPaymentProject] = useState(null);
    const [refetchPayments, setRefetchPayments] = useState(() => () => {});
    const [deletePayment] = useMutation(DELETE_PAYMENT);
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("ASC");
    const [confirmDeletePayment, setConfirmDeletePayment] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);

    const [showAddProject, setShowAddProject] = useState(false);
    const [editProjectId, setEditProjectId] = useState(null);
    const [deleteProjectId, setDeleteProjectId] = useState(null);
    const [deleteProjectName, setDeleteProjectName] = useState("");

    const buildFilterInput = () => {
        const filterInput = {};
        if (searchQuery) {
            filterInput.nameContains = searchQuery;
            filterInput.descriptionContains = searchQuery;
        }
        if (filters.status?.length) filterInput.statusIds = filters.status;
        if (filters.projectType?.length) filterInput.projectTypeIds = filters.projectType;
        if (filters.clientId?.length) filterInput.clientIds = filters.clientId;
        if (filters.managerId?.length) filterInput.managerIds = filters.managerId;
        if (filters.date?.from) filterInput.startDateFrom = filters.date.from;
        if (filters.date?.to) filterInput.startDateTo = filters.date.to;
        if (filters.cost?.min !== undefined) filterInput.costMin = filters.cost.min;
        if (filters.cost?.max !== undefined) filterInput.costMax = filters.cost.max;
        return filterInput;
    };

    const { data: paymentPurposesData } = useQuery(GET_PAYMENT_PURPOSES, { fetchPolicy: "cache-first" });
    const { data, loading, error, refetch } = useQuery(GET_PAGINATED_PROJECTS_WITH_TOTAL, {
        variables: {
            input: {
                page: page - 1,
                size,
                sortField,
                sortDirection,
                filter: buildFilterInput()
            }
        },
        fetchPolicy: "network-only"
    });

    const [deleteProject] = useMutation(DELETE_PROJECT);

    const handleConfirmDeletePayment = async () => {
        if (!confirmDeletePayment) return;
        try {
            await deletePayment({ variables: { id: confirmDeletePayment.id } });
            refetchPayments?.();
        } catch (e) {
            console.error("Error deleting payment:", e);
            alert("Error deleting payment: " + e.message);
        } finally {
            setConfirmDeletePayment(null);
        }
    };


    const handleAddPayment = (project, refetchPaymentsFn) => {
        setPaymentToEdit(null);
        setPaymentProject(project);
        setRefetchPayments(() => refetchPaymentsFn);
        setShowPaymentModal(true);
    };

    const handleEditPayment = (payment, project, refetchPaymentsFn) => {
        setPaymentToEdit(payment);
        setPaymentProject(project);
        setRefetchPayments(() => refetchPaymentsFn);
        setShowPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentToEdit(null);
        setPaymentProject(null);
    };

    const handlePaymentSaved = () => {
        setShowPaymentModal(false);
        setPaymentToEdit(null);
        refetchPayments?.();
    };

    const projects = data?.paginatedProjects?.content ?? [];
    const pageInfo = data?.paginatedProjects?.pageInfo;
    const total = pageInfo?.totalElements ?? 0;
    const pages = pageInfo?.totalPages ?? 1;

    return (
        <div className="project-management-container">
            <header className="page-header">
                <h1>Project Management</h1>
                <Button variant="primary" size="small" icon="➕" onClick={() => setShowAddProject(true)}>
                    Add Project
                </Button>
            </header>

            <ProjectFilterPanel
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
                expanded={filterPanelExpanded}
                setExpanded={setFilterPanelExpanded}
                onSortChange={(f, d) => { setSortField(f); setSortDirection(d); }}
                currentSortField={sortField}
                currentSortDirection={sortDirection}
            />

            {loading && <div className="loading-indicator">Loading projects...</div>}
            {error && <div className="error-message">Error: {error.message}</div>}

            {!loading && !error && (
                <>
                    <div className="projects-list">
                        {projects.length > 0 ? (
                            projects.map(p => (
                                <ProjectCard
                                    key={p.id}
                                    project={p}
                                    onEdit={() => setEditProjectId(p.id)}
                                    onDelete={() => { setDeleteProjectId(p.id); setDeleteProjectName(p.name); }}
                                    setPaymentToDelete={(payment) => setConfirmDeletePayment(payment)}
                                    onAddPayment={(refetch) => handleAddPayment(p, refetch)}
                                    onEditPayment={(payment, refetch) => handleEditPayment(payment, p, refetch)}
                                    onDeletePayment={(payment) => setConfirmDeletePayment(payment)}
                                />
                            ))
                        ) : (
                            <div className="no-items-message">
                                {Object.keys(filters).length > 0 || searchQuery
                                    ? "No projects match your search criteria."
                                    : "No projects found. Click 'Add Project'."}
                            </div>
                        )}
                    </div>
                    {pages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={pages}
                            onPageChange={setPage}
                            pageSize={size}
                            onPageSizeChange={(s) => { setPage(1); setSize(s); }}
                            totalItems={total}
                            pageSizeOptions={[5, 10, 25, 50]}
                        />
                    )}
                </>
            )}

            {showAddProject && (
                <AddProjectModal
                    isOpen
                    onClose={() => setShowAddProject(false)}
                    onCreated={() => { setShowAddProject(false); refetch(); }}
                />
            )}

            {editProjectId && (
                <EditProjectModal
                    isOpen
                    projectId={editProjectId}
                    onClose={() => setEditProjectId(null)}
                    onUpdated={() => { refetch(); setEditProjectId(null); }}
                />
            )}

            <ConfirmationDialog
                isOpen={!!deleteProjectId}
                onClose={() => setDeleteProjectId(null)}
                onConfirm={async () => {
                    await deleteProject({ variables: { id: deleteProjectId } });
                    refetch();
                    setDeleteProjectId(null);
                    setDeleteProjectName("");
                }}
                title="Delete Project"
                message={`Are you sure you want to delete the project "${deleteProjectName}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            <ConfirmationDialog
                isOpen={!!confirmDeletePayment}
                onClose={() => setConfirmDeletePayment(null)}
                onConfirm={handleConfirmDeletePayment}
                title="Delete Payment"
                message={`Are you sure you want to delete payment #${confirmDeletePayment?.transactionNumber}?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            <PaymentModal
                isOpen={showPaymentModal}
                editMode={!!paymentToEdit}
                payment={paymentToEdit}
                projectId={paymentProject?.id}
                purposes={paymentPurposesData?.paymentPurposes ?? []}
                onClose={handleClosePaymentModal}
                onSave={handlePaymentSaved}
            />
        </div>
    );
}
