import ProjectCard from "./components/ProjectCard/ProjectCard";
import ProjectFilterPanel from "./components/ProjectFilterPanel/ProjectFilterPanel";
import Pagination from "../../components/common/Pagination/Pagination";
import Button from "../../components/common/Button/Button";
import AddProjectModal from "./components/AddProjectModal";
import EditProjectModal from "./components/EditProjectModal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog/ConfirmationDialog";
import PaymentModal from "./components/PaymentModal/PaymentModal";
import ExportProjectDataModal from "./components/ExportDataModal/ExportProjectDataModal";
import Card from "../../components/common/Card/Card";
import ServiceDetailsView from "./components/ServiceDetailsView/ServiceDetailsView";
import ServiceImplementationDetailsModal from "./components/ServiceImplementationDetailsModal/ServiceImplementationDetailsModal";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
    DELETE_PAYMENT,
    GET_PAYMENT_PURPOSES,
    CANCEL_PROJECT,
    RESUME_PROJECT,
    PAUSE_PROJECT
} from "./graphql/projects.gql";

import {
    GET_PAGINATED_PROJECTS_WITH_TOTAL,
} from "./graphql/projectsPagination.gql";

const DELETE_PROJECT = gql`
    mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
    }
`;

export default function ProjectManagement() {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [confirmDeletePayment, setConfirmDeletePayment] = useState(null);
    const [showServiceDetailsModal, setShowServiceDetailsModal] = useState(false);
    const [selectedProjectService, setSelectedProjectService] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [paymentToEdit, setPaymentToEdit] = useState(null);
    const [paymentProject, setPaymentProject] = useState(null);
    const [refetchPayments, setRefetchPayments] = useState(() => () => {});
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("ASC");
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);
    const [showAddProject, setShowAddProject] = useState(false);
    const [editProjectId, setEditProjectId] = useState(null);
    const [deleteProjectId, setDeleteProjectId] = useState(null);
    const [deleteProjectName, setDeleteProjectName] = useState("");
    const [selectedServiceImplementation, setSelectedServiceImplementation] = useState(null);
    const [showImplementationDetailsModal, setShowImplementationDetailsModal] = useState(false);

    // Новые состояния для модальных окон подтверждения статуса проекта
    const [projectToPause, setProjectToPause] = useState(null);
    const [projectToResume, setProjectToResume] = useState(null);
    const [projectToCancel, setProjectToCancel] = useState(null);

    const { t } = useTranslation("projectManagement");
    const user = useSelector(state => state.user);

    // Мутации для управления статусом проекта
    const [pauseProject, { loading: pauseLoading }] = useMutation(PAUSE_PROJECT, {
        onCompleted: (data) => {
            toast.success(`Проект "${data.pauseProject.name}" успішно призупинено`);
            refetch();
        },
        onError: (error) => {
            toast.error(`Помилка призупинення проекту: ${error.message}`);
        }
    });

    const [resumeProject, { loading: resumeLoading }] = useMutation(RESUME_PROJECT, {
        onCompleted: (data) => {
            toast.success(`Проект "${data.resumeProject.name}" успішно відновлено`);
            refetch();
        },
        onError: (error) => {
            toast.error(`Помилка відновлення проекту: ${error.message}`);
        }
    });

    const [cancelProject, { loading: cancelLoading }] = useMutation(CANCEL_PROJECT, {
        onCompleted: (data) => {
            toast.success(`Проект "${data.cancelProject.name}" скасовано`);
            refetch();
        },
        onError: (error) => {
            toast.error(`Помилка скасування проекту: ${error.message}`);
        }
    });

    // Обработчики действий над проектами
    const handlePauseProject = async () => {
        if (!projectToPause) return;
        try {
            await pauseProject({ variables: { projectId: projectToPause.id } });
        } catch (error) {
            console.error("Error pausing project:", error);
        } finally {
            setProjectToPause(null);
        }
    };

    const handleResumeProject = async () => {
        if (!projectToResume) return;
        try {
            await resumeProject({ variables: { projectId: projectToResume.id } });
        } catch (error) {
            console.error("Error resuming project:", error);
        } finally {
            setProjectToResume(null);
        }
    };

    const handleCancelProject = async () => {
        if (!projectToCancel) return;
        try {
            await cancelProject({ variables: { projectId: projectToCancel.id } });
        } catch (error) {
            console.error("Error canceling project:", error);
        } finally {
            setProjectToCancel(null);
        }
    };

    // Build filter input
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

    // Load payment purposes
    const { data: paymentPurposesData, error: errorPurposes } = useQuery(GET_PAYMENT_PURPOSES, {
        fetchPolicy: "cache-first"
    });
    useEffect(() => {
        if (errorPurposes) {
            console.error(errorPurposes);
            toast.error("Не вдалося завантажити цілі платежів: " + errorPurposes.message);
        }
    }, [errorPurposes]);

    // Load paginated projects
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
    useEffect(() => {
        if (error) {
            console.error(error);
            toast.error("Не вдалося завантажити проєкти: " + error.message);
        }
    }, [error]);

    const [deletePayment] = useMutation(DELETE_PAYMENT);
    const [deleteProject] = useMutation(DELETE_PROJECT);

    // Confirm delete payment
    const handleConfirmDeletePayment = async () => {
        if (!confirmDeletePayment) return;
        try {
            await deletePayment({ variables: { id: confirmDeletePayment.id } });
            toast.success("Платіж видалено");
            refetch();
            refetchPayments();
        } catch (e) {
            console.error(e);
            toast.error("Не вдалося видалити платіж: " + e.message);
        } finally {
            setConfirmDeletePayment(null);
        }
    };

    // Add / edit payment
    const handleAddPayment = (project, refetchFn) => {
        setPaymentToEdit(null);
        setPaymentProject(project);
        setRefetchPayments(() => refetchFn);
        setShowPaymentModal(true);
    };
    const handleEditPayment = (payment, project, refetchFn) => {
        setPaymentToEdit(payment);
        setPaymentProject(project);
        setRefetchPayments(() => refetchFn);
        setShowPaymentModal(true);
    };

    // Close payment modal
    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentToEdit(null);
        setPaymentProject(null);
    };
    const handlePaymentSaved = () => {
        toast.success("Платіж збережено");
        setShowPaymentModal(false);
        setPaymentToEdit(null);
        refetchPayments();
    };

    // Export
    const handleExportData = () => setShowExportModal(true);

    // Service details
    const handleOpenServiceDetails = projectService => {
        setSelectedProjectService(projectService);
        setShowServiceDetailsModal(true);
    };
    const handleCloseServiceDetails = () => {
        setSelectedProjectService(null);
        setShowServiceDetailsModal(false);
    };

    // Implementation details
    const handleShowImplementationDetails = impl => {
        setSelectedServiceImplementation(impl);
        setShowImplementationDetailsModal(true);
    };
    const handleCloseImplementationDetails = () => {
        setSelectedServiceImplementation(null);
        setShowImplementationDetailsModal(false);
    };

    // Delete project
    const handleConfirmDeleteProject = async () => {
        try {
            await deleteProject({ variables: { id: deleteProjectId } });
            toast.success(`Проєкт «${deleteProjectName}» видалено`);
            refetch();
        } catch (e) {
            console.error(e);
            toast.error("Не вдалося видалити проєкт: " + e.message);
        } finally {
            setDeleteProjectId(null);
            setDeleteProjectName("");
        }
    };

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

    const projects = data?.paginatedProjects?.content ?? [];
    const pageInfo = data?.paginatedProjects?.pageInfo;
    const total = pageInfo?.totalElements ?? 0;
    const pages = pageInfo?.totalPages ?? 1;

    return (
        <div className="project-management-container">
            <header className="page-header">
                <h1>Управління проєктами</h1>
                <div className="header-actions">
                    <Button variant="outline" size="small" icon="📊" onClick={handleExportData}>
                        Експортувати дані
                    </Button>
                    <Button variant="primary" size="small" icon="➕" onClick={() => setShowAddProject(true)}>
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
                onSortChange={(f, d) => {
                    setSortField(f);
                    setSortDirection(d);
                }}
                currentSortField={sortField}
                currentSortDirection={sortDirection}
            />

            {loading && <div className="loading-indicator">Завантаження проєктів...</div>}
            {!loading && projects.length === 0 && (
                <div className="no-items-message">
                    {Object.keys(filters).length > 0 || searchQuery
                        ? "Жоден проєкт не відповідає критеріям пошуку."
                        : "Проєкти відсутні. Натисніть «Додати проєкт»."}
                </div>
            )}

            {!loading && (
                <>
                    <div className="projects-list">
                        {projects.map(p => (
                            <ProjectCard
                                key={p.id}
                                project={p}
                                onEdit={() => setEditProjectId(p.id)}
                                onDelete={() => {
                                    setDeleteProjectId(p.id);
                                    setDeleteProjectName(p.name);
                                }}
                                setPaymentToDelete={payment => setConfirmDeletePayment(payment)}
                                onAddPayment={handleAddPayment}
                                onEditPayment={handleEditPayment}
                                onDeletePayment={() => setConfirmDeletePayment(p.payment)}
                                onOpenServiceDetails={handleOpenServiceDetails}
                                onShowImplementationDetails={handleShowImplementationDetails}
                                onPauseProject={(project) => setProjectToPause(project)}
                                onResumeProject={(project) => setProjectToResume(project)}
                                onCancelProject={(project) => setProjectToCancel(project)}
                            />
                        ))}
                    </div>

                    {pages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={pages}
                            onPageChange={setPage}
                            pageSize={size}
                            onPageSizeChange={s => {
                                setPage(1);
                                setSize(s);
                            }}
                            totalItems={total}
                            pageSizeOptions={[5, 10, 25, 50]}
                        />
                    )}
                </>
            )}

            {/* Модальные окна */}
            {showAddProject && (
                <AddProjectModal
                    isOpen
                    onClose={() => setShowAddProject(false)}
                    onCreated={() => {
                        setShowAddProject(false);
                        refetch();
                    }}
                />
            )}

            {editProjectId && (
                <EditProjectModal
                    isOpen
                    projectId={editProjectId}
                    onClose={() => setEditProjectId(null)}
                    onUpdated={() => {
                        refetch();
                        setEditProjectId(null);
                    }}
                />
            )}

            {/* Модальные окна подтверждения действий с проектами */}
            <ConfirmationDialog
                isOpen={!!deleteProjectId}
                onClose={() => setDeleteProjectId(null)}
                onConfirm={handleConfirmDeleteProject}
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

            <ConfirmationDialog
                isOpen={!!projectToPause}
                onClose={() => setProjectToPause(null)}
                onConfirm={handlePauseProject}
                title="Призупинення проекту"
                message={`Ви впевнені, що хочете призупинити проект "${projectToPause?.name}"? Це призупинить всі поточні роботи.`}
                confirmText="Призупинити"
                cancelText="Скасувати"
                variant="warning"
            />

            <ConfirmationDialog
                isOpen={!!projectToResume}
                onClose={() => setProjectToResume(null)}
                onConfirm={handleResumeProject}
                title="Відновлення проекту"
                message={`Ви впевнені, що хочете відновити роботу над проектом "${projectToResume?.name}"?`}
                confirmText="Відновити"
                cancelText="Скасувати"
                variant="success"
            />

            <ConfirmationDialog
                isOpen={!!projectToCancel}
                onClose={() => setProjectToCancel(null)}
                onConfirm={handleCancelProject}
                title="Скасування проекту"
                message={`Ви впевнені, що хочете скасувати проект "${projectToCancel?.name}"? Ця дія незворотна!`}
                confirmText="Скасувати проект"
                cancelText="Назад"
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
                onShowImplementationDetails={handleShowImplementationDetails}
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