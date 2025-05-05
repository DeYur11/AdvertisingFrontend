import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import Badge from "../../../../components/common/Badge/Badge";
import Card from "../../../../components/common/Card/Card";
import TaskForm from "../TaskForm/TaskForm";
import ConfirmationDialog from "../../../../components/common/ConfirmationDialog/ConfirmationDialog";
import {
    GET_SERVICES_IN_PROGRESS_BY_PROJECT_SERVICE,
    GET_PROJECT_DETAILS,
    GET_WORKERS,
    GET_TASK_STATUSES
} from "../../graphql/queries";
import {
    CREATE_TASK,
    UPDATE_TASK,
    DELETE_TASK
} from "../../graphql/mutations";
import "./ServiceDetailsModal.css";
import {toast} from "react-toastify";

export default function ServiceDetailsModal({
                                                isOpen,
                                                onClose,
                                                projectService,
                                                onCreateService
                                            }) {
    // State for task management
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedServiceInProgress, setSelectedServiceInProgress] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Fetch service implementation and project data
    const { data: sipData, loading: sipLoading, error: sipError, refetch: refetchServiceData } = useQuery(GET_SERVICES_IN_PROGRESS_BY_PROJECT_SERVICE, {
        variables: { projectServiceId: projectService?.id || "" },
        skip: !projectService?.id,
        fetchPolicy: "network-only"
    });

    const { data: projectData } = useQuery(GET_PROJECT_DETAILS, {
        variables: { projectId: projectService?.project?.id || "" },
        skip: !projectService?.project?.id,
        fetchPolicy: "network-only"
    });

    // Fetch workers and task statuses for task form
    const { data: workersData } = useQuery(GET_WORKERS);
    const { data: statusesData } = useQuery(GET_TASK_STATUSES);

    // Mutations for task management
    const [createTask] = useMutation(CREATE_TASK);
    const [updateTask] = useMutation(UPDATE_TASK);
    const [deleteTask] = useMutation(DELETE_TASK);

    if (!isOpen || !projectService) return null;

    const handleCreateServiceClick = () => {
        onCreateService(projectService);
        onClose();
    };

    // Task management functions
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
            refetchServiceData();
        } catch (error) {
            console.error("Error deleting task:", error);
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
                toast.success("Task updated successfully!");
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
                toast.success("Task created successfully!");
            }

            refetchServiceData();
            setShowTaskModal(false);
        } catch (error) {
            console.error("Error saving task:", error);
            toast.error(error?.message || "Failed to save task. Please try again.");
        }
    };


    const missingCount = (projectService?.amount || 0) - (projectService?.servicesInProgress?.length || 0);
    const project = projectData?.project || projectService?.project || {};

    const workers = workersData?.workers || [];
    const taskStatuses = statusesData?.taskStatuses || [];

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
                title={`Service Details: ${projectService?.service?.serviceName || "—"}`}
                size="large"
            >
                <div className="service-details-container">
                    <section className="service-overview">
                        <h3>Service Information</h3>
                        <div className="info-horizontal-layout">
                            <div className="service-info-section">
                                <h4>Service Details</h4>
                                <div className="horizontal-detail-group">
                                    <div className="detail-item">
                                        <span className="detail-label">Service Name:</span>
                                        <span className="detail-value">{projectService?.service?.serviceName || "—"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Service Type:</span>
                                        <span className="detail-value">{projectService?.service?.serviceType?.name || "—"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Estimated Cost:</span>
                                        <span className="detail-value cost">
                                            ${parseFloat(projectService?.service?.estimateCost || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    {projectService?.service?.duration && (
                                        <div className="detail-item">
                                            <span className="detail-label">Expected Duration:</span>
                                            <span className="detail-value">{projectService.service.duration} days</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="project-info-section">
                                <h4>Project Details</h4>
                                <div className="horizontal-detail-group">
                                    <div className="detail-item">
                                        <span className="detail-label">Project:</span>
                                        <span className="detail-value">{project?.name || "—"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Client:</span>
                                        <span className="detail-value">{project?.client?.name || "—"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Project Status:</span>
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
                                            <span className="detail-label">Project Manager:</span>
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
                                <h4>Project Description</h4>
                                <p>{project.description}</p>
                            </div>
                        )}

                        <div className="horizontal-layout">
                            <div className="project-dates">
                                <h4>Project Timeline</h4>
                                <div className="dates-container">
                                    <div className="detail-item">
                                        <span className="detail-label">Project Start:</span>
                                        <span className="detail-value">{formatDate(project?.startDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Project End:</span>
                                        <span className="detail-value">{formatDate(project?.endDate)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="implementation-stats">
                                <h4>Implementation Stats</h4>
                                <div className="stats-container">
                                    <div className="stat-item">
                                        <div className="stat-value">{projectService?.amount || 0}</div>
                                        <div className="stat-label">Required</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{projectService?.servicesInProgress?.length || 0}</div>
                                        <div className="stat-label">Current</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{missingCount}</div>
                                        <div className="stat-label">Missing</div>
                                    </div>
                                </div>
                            </div>

                            {missingCount > 0 && (
                                <div className="action-buttons">
                                    <Button variant="primary" onClick={handleCreateServiceClick}>
                                        Create New Service Implementation
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="implementations-section">
                        <h3>Service Implementations</h3>

                        {sipLoading ? (
                            <div className="loading-message">Loading service implementations...</div>
                        ) : sipError ? (
                            <div className="error-message">Error loading implementations: {sipError.message}</div>
                        ) : !sipData?.servicesInProgressByProjectService?.length ? (
                            <div className="no-implementations">
                                <p>No service implementations have been created yet.</p>
                            </div>
                        ) : (
                            <div className="implementations-grid">
                                {sipData.servicesInProgressByProjectService.map(sip => (
                                    <Card key={sip.id} className="implementation-card">
                                        <div className="implementation-header">
                                            <h4>Implementation</h4>
                                            <Badge
                                                variant={sip.status?.name?.toLowerCase() === "completed" ? "success" : "primary"}
                                                size="small"
                                            >
                                                {sip.status?.name || "—"}
                                            </Badge>
                                        </div>

                                        <div className="implementation-details-row">
                                            <div className="detail-item">
                                                <span className="detail-label">Start Date:</span>
                                                <span className="detail-value">{formatDate(sip.startDate)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">End Date:</span>
                                                <span className="detail-value">{formatDate(sip.endDate)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Cost:</span>
                                                <span className="detail-value cost">
                                                    {sip.cost ? `$${parseFloat(sip.cost).toFixed(2)}` : "—"}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Tasks:</span>
                                                <span className="detail-value">{sip.tasks?.length || 0} total</span>
                                            </div>
                                        </div>

                                        <div className="task-progress">
                                            <div className="progress-label">
                                                <span>Task Completion</span>
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
                                                <h4>Tasks ({sip.tasks?.length || 0})</h4>
                                                <Button
                                                    variant="primary"
                                                    size="small"
                                                    onClick={() => handleAddTask(sip)}
                                                >
                                                    + Add Task
                                                </Button>
                                            </div>

                                            {sip.tasks?.length > 0 ? (
                                                <div className="compact-tasks-table">
                                                    <div className="task-table-header">
                                                        <div className="task-col task-name-col">Task</div>
                                                        <div className="task-col task-status-col">Status</div>
                                                        <div className="task-col task-priority-col">Priority</div>
                                                        <div className="task-col task-deadline-col">Deadline</div>
                                                        <div className="task-col task-assigned-col">Assigned To</div>
                                                        <div className="task-col task-value-col">Value</div>
                                                        <div className="task-col task-actions-col">Actions</div>
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
                                                                    ? `$${parseFloat(task.value).toFixed(2)}`
                                                                    : "—"}
                                                            </div>
                                                            <div className="task-col task-actions-col">
                                                                <div className="task-actions">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="small"
                                                                        onClick={() => handleEditTask(task, sip)}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="danger"
                                                                        size="small"
                                                                        onClick={() => handleDeleteTask(task)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="no-tasks-message">
                                                    No tasks have been added for this service implementation yet.
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

            {/* Task Form Modal */}
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

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteTask}
                title="Delete Task"
                message={`Are you sure you want to delete the task "${taskToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
}