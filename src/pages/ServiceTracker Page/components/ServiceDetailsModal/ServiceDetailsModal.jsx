import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import Card from "../../../../components/common/Card/Card";
import TaskForm from "../TaskForm/TaskForm";
import EditServiceModal from "../EditServiceModal/EditServiceModal";
import ConfirmationDialog from "../../../../components/common/ConfirmationDialog/ConfirmationDialog";
import {
    GET_SERVICES_IN_PROGRESS_BY_PROJECT_SERVICE,
    GET_PROJECT_DETAILS,
    GET_WORKERS,
    GET_TASK_STATUSES,
    GET_SERVICE_STATUSES
} from "../../graphql/queries";
import {
    CREATE_TASK,
    UPDATE_TASK,
    DELETE_TASK,
    DELETE_SERVICE_IN_PROGRESS
} from "../../graphql/mutations";
import "./ServiceDetailsModal.css";
import { toast } from "react-toastify";

export default function ServiceDetailsModal({
                                                isOpen,
                                                onClose,
                                                projectService,
                                                onCreateService
                                            }) {
    // Стан для управління завданнями
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedServiceInProgress, setSelectedServiceInProgress] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Стан для управління імплементаціями сервісу
    const [showEditServiceModal, setShowEditServiceModal] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState(null);
    const [showDeleteServiceConfirm, setShowDeleteServiceConfirm] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // Отримуємо дані про імплементацію сервісу та проект
    const { data: sipData, loading: sipLoading, error: sipError, refetch: refetchServiceData } = useQuery(GET_SERVICES_IN_PROGRESS_BY_PROJECT_SERVICE, {
        variables: { projectServiceId: projectService?.id || "" },
        skip: !projectService?.id,
        fetchPolicy: "network-only"
    });

    const { data: projectData, refetch: refetchProject } = useQuery(GET_PROJECT_DETAILS, {
        variables: { projectId: projectService?.project?.id || "" },
        skip: !projectService?.project?.id,
        fetchPolicy: "network-only"
    });

    // Отримуємо дані про працівників та статуси для форм
    const { data: workersData } = useQuery(GET_WORKERS);
    const { data: taskStatusesData } = useQuery(GET_TASK_STATUSES);
    const { data: serviceStatusesData } = useQuery(GET_SERVICE_STATUSES);

    // Мутації для управління завданнями
    const [createTask] = useMutation(CREATE_TASK);
    const [updateTask] = useMutation(UPDATE_TASK);
    const [deleteTask] = useMutation(DELETE_TASK);

    // Мутації для управління імплементаціями сервісу
    const [deleteServiceInProgress] = useMutation(DELETE_SERVICE_IN_PROGRESS);

    if (!isOpen || !projectService) return null;

    const handleCreateServiceClick = () => {
        onCreateService(projectService);
        onClose();
    };

    // Функції управління імплементаціями сервісу
    const handleEditService = (serviceInProgress) => {
        setServiceToEdit(serviceInProgress);
        setShowEditServiceModal(true);
    };

    const handleDeleteService = (serviceInProgress) => {
        setServiceToDelete(serviceInProgress);
        setShowDeleteServiceConfirm(true);
    };

    const confirmDeleteService = async () => {
        try {
            await deleteServiceInProgress({
                variables: {
                    id: parseInt(serviceToDelete.id)
                }
            });
            toast.success("Імплементацію видалено успішно");
            refetchServiceData();
            refetchProject();
        } catch (error) {
            console.error("Помилка видалення імплементації сервісу:", error);
            toast.error(error?.message || "Неможливо видалити імплементацію.");
        }
        setShowDeleteServiceConfirm(false);
    };

    const handleServiceSaved = () => {
        setShowEditServiceModal(false);
        refetchServiceData();
        refetchProject();
    };

    // Функції управління завданнями
    const handleAddTask = (serviceInProgress) => {
        setSelectedServiceInProgress(serviceInProgress);
        setCurrentTask({
            name: "",
            description: "",
            deadline: new Date().toISOString().split("T")[0],
            assignedWorkerId: "",
            taskStatusId: "",
            priority: "5",
            value: ""
        });
        setShowTaskModal(true);
    };

    const handleEditTask = (task, serviceInProgress) => {
        setSelectedServiceInProgress(serviceInProgress);
        setCurrentTask({
            id: task.id,
            name: task.name,
            description: task.description || "",
            deadline: task.deadline,
            assignedWorkerId: task.assignedWorker?.id || "",
            taskStatusId: task.taskStatus?.id || "",
            priority: task.priority || "5",
            value: task.value || ""
        });
        setShowTaskModal(true);
    };

    const handleDeleteTask = (task) => {
        setTaskToDelete(task);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteTask = async () => {
        try {
            await deleteTask({
                variables: {
                    id: parseInt(taskToDelete.id)
                }
            });
            toast.success("Завдання видалено успішно!");
            refetchServiceData();
            refetchProject();
        } catch (error) {
            console.error("Помилка видалення завдання:", error);
            toast.error(error?.message || "Неможливо видалити завдання.");
        }
        setShowDeleteConfirm(false);
    };

    const handleTaskSave = async (taskData) => {
        try {
            if (taskData.id) {
                await updateTask({
                    variables: {
                        id: parseInt(taskData.id),
                        input: {
                            name: taskData.name,
                            description: taskData.description || null,
                            deadline: taskData.deadline,
                            assignedWorkerId: parseInt(taskData.assignedWorkerId),
                            taskStatusId: parseInt(taskData.taskStatusId),
                            priority: taskData.priority ? parseInt(taskData.priority) : null,
                            value: taskData.value ? parseFloat(taskData.value) : null
                        }
                    }
                });
                toast.success("Завдання оновлено успішно!");
            } else {
                await createTask({
                    variables: {
                        input: {
                            name: taskData.name,
                            description: taskData.description || null,
                            deadline: taskData.deadline,
                            serviceInProgressId: parseInt(selectedServiceInProgress.id),
                            assignedWorkerId: parseInt(taskData.assignedWorkerId),
                            priority: taskData.priority ? parseInt(taskData.priority) : null,
                            value: taskData.value ? parseFloat(taskData.value) : null
                        }
                    }
                });
                toast.success("Завдання створено успішно!");
            }

            refetchServiceData();
            refetchProject();
            setShowTaskModal(false);
        } catch (error) {
            console.error("Помилка збереження завдання:", error);
            toast.error(error?.message || "Неможливо зберегти завдання...");
        }
    };

    const missingCount = (projectService?.amount || 0) - (projectService?.servicesInProgress?.length || 0);
    const project = projectData?.project || projectService?.project || {};

    const workers = workersData?.workers || [];
    const taskStatuses = taskStatusesData?.taskStatuses || [];

    const calculateTaskCompletion = (sip) => {
        const tasks = sip?.tasks || [];
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(task => task.taskStatus?.name?.toLowerCase() === "completed").length;
        return Math.round((completed / tasks.length) * 100);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return "—";
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Деталі сервісу: ${projectService?.service?.serviceName || "—"}`}
                size="large"
            >
                <div className="service-details-container">
                    <section className="service-overview">
                        <h3>Інформація про сервіс</h3>
                        <div className="info-horizontal-layout">
                            <div className="service-info-section">
                                <h4>Деталі сервісу</h4>
                                <div className="horizontal-detail-group">
                                    <div className="detail-item">
                                        <span className="detail-label">Назва сервісу:</span>
                                        <span className="detail-value">{projectService?.service?.serviceName || "—"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Тип сервісу:</span>
                                        <span className="detail-value">{projectService?.service?.serviceType?.name || "—"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Орієнтовна вартість:</span>
                                        <span className="detail-value cost">
                                            ${parseFloat(projectService?.service?.estimateCost || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    {projectService?.service?.duration && (
                                        <div className="detail-item">
                                            <span className="detail-label">Очікувана тривалість:</span>
                                            <span className="detail-value">{projectService.service.duration} днів</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="project-info-section">
                                <h4>Деталі проекту</h4>
                                <div className="horizontal-detail-group">
                                    <div className="detail-item">
                                        <span className="detail-label">Проект:</span>
                                        <span className="detail-value">{project?.name || "—"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Клієнт:</span>
                                        <span className="detail-value">{project?.client?.name || "—"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Статус проекту:</span>
                                        <span className="detail-value">
                                            <Badge
                                                variant={project?.status?.name?.toLowerCase() === "completed" ? "success" : "primary"}
                                                size="small"
                                            >
                                                {project?.status?.name || "—"}
                                            </Badge>
                                        </span>
                                    </div>
                                    {project?.manager && (
                                        <div className="detail-item">
                                            <span className="detail-label">Менеджер проекту:</span>
                                            <span className="detail-value">
                                                {project.manager.name || "—"} {project.manager.surname || ""}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {project?.description && (
                            <div className="project-description">
                                <h4>Опис проекту</h4>
                                <p>{project.description}</p>
                            </div>
                        )}

                        <div className="horizontal-layout">
                            <div className="project-dates">
                                <h4>Часові рамки проекту</h4>
                                <div className="dates-container">
                                    <div className="detail-item">
                                        <span className="detail-label">Початок проекту:</span>
                                        <span className="detail-value">{formatDate(project?.startDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Кінець проекту:</span>
                                        <span className="detail-value">{formatDate(project?.endDate)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="implementation-stats">
                                <h4>Статистика імплементацій</h4>
                                <div className="stats-container">
                                    <div className="stat-item">
                                        <div className="stat-value">{projectService?.amount || 0}</div>
                                        <div className="stat-label">Необхідно</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{projectService?.servicesInProgress?.length || 0}</div>
                                        <div className="stat-label">Наявно</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{missingCount}</div>
                                        <div className="stat-label">Бракує</div>
                                    </div>
                                </div>
                            </div>

                            {missingCount > 0 && (
                                <div className="action-buttons">
                                    <Button variant="primary" onClick={handleCreateServiceClick}>
                                        Створити нову імплементацію сервісу
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="implementations-section">
                        <h3>Імплементації сервісу</h3>

                        {sipLoading ? (
                            <div className="loading-message">Завантаження імплементацій сервісу...</div>
                        ) : sipError ? (
                            <div className="error-message">Помилка завантаження імплементацій: {sipError.message}</div>
                        ) : !sipData?.servicesInProgressByProjectService?.length ? (
                            <div className="no-implementations">
                                <p>Ще не створено жодної імплементації сервісу.</p>
                            </div>
                        ) : (
                            <div className="implementations-grid">
                                {sipData.servicesInProgressByProjectService.map(sip => (
                                    <Card key={sip.id} className="implementation-card">
                                        <div className="implementation-header">
                                            <h4>Імплементація</h4>
                                            <div className="implementation-actions">
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => handleEditService(sip)}
                                                >
                                                    Редагувати
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="small"
                                                    onClick={() => handleDeleteService(sip)}
                                                >
                                                    Видалити
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="implementation-status">
                                            <Badge
                                                variant={sip.status?.name?.toLowerCase() === "completed" ? "success" : "primary"}
                                                size="small"
                                            >
                                                {sip.status?.name || "—"}
                                            </Badge>
                                        </div>

                                        <div className="implementation-details-row">
                                            <div className="detail-item">
                                                <span className="detail-label">Дата початку:</span>
                                                <span className="detail-value">{formatDate(sip.startDate)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Дата завершення:</span>
                                                <span className="detail-value">{formatDate(sip.endDate)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Вартість:</span>
                                                <span className="detail-value cost">
                                                    {sip.cost ? `${parseFloat(sip.cost).toFixed(2)}` : "—"}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Завдання:</span>
                                                <span className="detail-value">{sip.tasks?.length || 0} загалом</span>
                                            </div>
                                        </div>

                                        <div className="task-progress">
                                            <div className="progress-label">
                                                <span>Прогрес виконання</span>
                                                <span>{calculateTaskCompletion(sip)}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${calculateTaskCompletion(sip)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="tasks-list">
                                            <div className="tasks-header">
                                                <h4>Завдання ({sip.tasks?.length || 0})</h4>
                                                <Button
                                                    variant="primary"
                                                    size="small"
                                                    onClick={() => handleAddTask(sip)}
                                                >
                                                    + Додати завдання
                                                </Button>
                                            </div>

                                            {sip.tasks?.length > 0 ? (
                                                <div className="compact-tasks-table">
                                                    <div className="task-table-header">
                                                        <div className="task-col task-name-col">Завдання</div>
                                                        <div className="task-col task-status-col">Статус</div>
                                                        <div className="task-col task-priority-col">Пріоритет</div>
                                                        <div className="task-col task-deadline-col">Дедлайн</div>
                                                        <div className="task-col task-assigned-col">Виконавець</div>
                                                        <div className="task-col task-value-col">Вартість</div>
                                                        <div className="task-col task-actions-col">Дії</div>
                                                    </div>
                                                    {sip.tasks.map(task => (
                                                        <div key={task.id} className="task-table-row">
                                                            <div className="task-col task-name-col">
                                                                <div className="task-name">{task.name || "—"}</div>
                                                                {task.description && (
                                                                    <div className="task-description-tooltip">
                                                                        <span className="description-icon">ⓘ</span>
                                                                        <span className="tooltip-text">{task.description}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="task-col task-status-col">
                                                                <Badge
                                                                    variant={
                                                                        task.taskStatus?.name?.toLowerCase() === "completed" ? "success"
                                                                            : task.taskStatus?.name?.toLowerCase() === "in progress" ? "primary"
                                                                                : "warning"
                                                                    }
                                                                    size="small"
                                                                >
                                                                    {task.taskStatus?.name || "—"}
                                                                </Badge>
                                                            </div>
                                                            <div className="task-col task-priority-col">
                                                                {task.priority || "—"}
                                                            </div>
                                                            <div className="task-col task-deadline-col">
                                                                {formatDate(task.deadline)}
                                                            </div>
                                                            <div className="task-col task-assigned-col">
                                                                {task.assignedWorker
                                                                    ? `${task.assignedWorker.name || ""} ${task.assignedWorker.surname || ""}`
                                                                    : "—"}
                                                            </div>
                                                            <div className="task-col task-value-col">
                                                                {task.value
                                                                    ? `${parseFloat(task.value).toFixed(2)}`
                                                                    : "—"}
                                                            </div>
                                                            <div className="task-col task-actions-col">
                                                                <div className="task-actions">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="small"
                                                                        onClick={() => handleEditTask(task, sip)}
                                                                    >
                                                                        Редагувати
                                                                    </Button>
                                                                    <Button
                                                                        variant="danger"
                                                                        size="small"
                                                                        onClick={() => handleDeleteTask(task)}
                                                                    >
                                                                        Видалити
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="no-tasks-message">
                                                    Для цієї імплементації сервісу ще не додано жодного завдання.
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </Modal>

            {/* Модальне вікно форми завдання */}
            {showTaskModal && (
                <TaskForm
                    isOpen={showTaskModal}
                    onClose={() => setShowTaskModal(false)}
                    onSave={handleTaskSave}
                    task={currentTask}
                    workers={workers}
                    statuses={taskStatuses}
                />
            )}

            {/* Діалог підтвердження видалення завдання */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteTask}
                title="Видалення завдання"
                message={`Ви впевнені, що хочете видалити завдання "${taskToDelete?.name}"? Цю дію неможливо скасувати.`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />

            {/* Модальне вікно редагування сервісу */}
            {showEditServiceModal && serviceToEdit && (
                <EditServiceModal
                    isOpen={showEditServiceModal}
                    onClose={() => setShowEditServiceModal(false)}
                    onSave={handleServiceSaved}
                    serviceInProgress={serviceToEdit}
                    serviceStatuses={serviceStatusesData?.serviceInProgressStatuses || []}
                />
            )}

            {/* Діалог підтвердження видалення сервісу */}
            <ConfirmationDialog
                isOpen={showDeleteServiceConfirm}
                onClose={() => setShowDeleteServiceConfirm(false)}
                onConfirm={confirmDeleteService}
                title="Видалення імплементації сервісу"
                message={`Ви впевнені, що хочете видалити цю імплементацію сервісу? Це також видалить усі пов'язані завдання. Цю дію неможливо скасувати.`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />
        </>
    );
}