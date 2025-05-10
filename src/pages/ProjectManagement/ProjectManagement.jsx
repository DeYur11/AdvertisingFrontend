// ==== ProjectManagement.jsx ====

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
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
import ExportProjectDataModal from "./components/ExportDataModal/ExportProjectDataModal";
import {DELETE_PAYMENT, GET_PAYMENT_PURPOSES} from "./graphql/projects.gql";
import Card from "../../components/common/Card/Card";
import {useSelector} from "react-redux";
import ServiceDetailsView from "./components/ServiceDetailsView/ServiceDetailsView";
import ServiceImplementationDetailsModal
    from "./components/ServiceImplementationDetailsModal/ServiceImplementationDetailsModal";

const DELETE_PROJECT = gql`
    mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
    }
`;

export default function ProjectManagement() {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [showServiceDetailsModal, setShowServiceDetailsModal] = useState(false);
    const [selectedProjectService, setSelectedProjectService] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
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
    const { t } = useTranslation("projectManagement");
    const [showAddProject, setShowAddProject] = useState(false);
    const [editProjectId, setEditProjectId] = useState(null);
    const [deleteProjectId, setDeleteProjectId] = useState(null);
    const [deleteProjectName, setDeleteProjectName] = useState("");
    const [selectedServiceImplementation, setSelectedServiceImplementation] = useState(null);
    const [showImplementationDetailsModal, setShowImplementationDetailsModal] = useState(false);

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

    const handleOpenServiceDetails = (projectService) => {
        setSelectedProjectService(projectService);
        setShowServiceDetailsModal(true);
    };

    const handleCloseServiceDetails = () => {
        setSelectedProjectService(null);
        setShowServiceDetailsModal(false);
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

    const handleExportData = () => {
        setShowExportModal(true);
    };

    const projects = data?.paginatedProjects?.content ?? [];
    const pageInfo = data?.paginatedProjects?.pageInfo;
    const total = pageInfo?.totalElements ?? 0;
    const pages = pageInfo?.totalPages ?? 1;

    const user = useSelector(state => state.user);
    if (user.mainRole !== "PROJECT_MANAGER") {
        return (
            <div className="dashboard-container">
                <Card className="access-denied">
                    <div className="access-denied-icon">⚠️</div>
                    <h2>Доступ заборонено</h2>
                    <p>Ця сторінка доступна лише менеджерам проєктів.</p>
                </Card>
            </div>
        );
    }

    const handleShowImplementationDetails = (implementation) => {
        setSelectedServiceImplementation(implementation);
        setShowImplementationDetailsModal(true);
    };

// Додати функцію для закриття модального вікна
    const handleCloseImplementationDetails = () => {
        setShowImplementationDetailsModal(false);
        setSelectedServiceImplementation(null);
    };

    return (
        <div className="project-management-container">
            <header className="page-header">
                <h1>Управління проєктами</h1>
                <div className="header-actions">
                    <Button
                        variant="outline"
                        size="small"
                        icon="📊"
                        onClick={handleExportData}
                    >
                        Експортувати дані
                    </Button>
                    <Button
                        variant="primary"
                        size="small"
                        icon="➕"
                        onClick={() => setShowAddProject(true)}
                    >
                        Додати проєкт
                    </Button>
                </div>
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

            {loading && <div className="loading-indicator">Завантаження проєктів...</div>}
            {error && <div className="error-message">Помилка: {error.message}</div>}

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
                                    onOpenServiceDetails={handleOpenServiceDetails}
                                    onShowImplementationDetails={handleShowImplementationDetails}
                                />
                            ))
                        ) : (
                            <div className="no-items-message">
                                {Object.keys(filters).length > 0 || searchQuery
                                    ? "Жоден проєкт не відповідає критеріям пошуку."
                                    : "Проєкти відсутні. Натисніть «Додати проєкт»."}
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
                title="Видалення проєкту"
                message={`Ви впевнені, що хочете видалити проєкт «${deleteProjectName}»?`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />

            <ConfirmationDialog
                isOpen={!!confirmDeletePayment}
                onClose={() => setConfirmDeletePayment(null)}
                onConfirm={handleConfirmDeletePayment}
                title="Видалення платежу"
                message={`Ви впевнені, що хочете видалити платіж №${confirmDeletePayment?.transactionNumber}?`}
                confirmText="Видалити"
                cancelText="Скасувати"
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

            <ServiceDetailsView
                isOpen={showServiceDetailsModal}
                onClose={handleCloseServiceDetails}
                projectService={selectedProjectService}
            />

            <ExportProjectDataModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                filters={buildFilterInput()}
                currentSortField={sortField}
                currentSortDirection={sortDirection}
            />

            <ServiceImplementationDetailsModal
                isOpen={showImplementationDetailsModal}
                onClose={handleCloseImplementationDetails}
                serviceImplementation={selectedServiceImplementation}
            />
        </div>
    );
}