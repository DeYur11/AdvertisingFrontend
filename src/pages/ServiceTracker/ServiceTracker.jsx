// src/pages/ServiceTracker/ServiceTracker.jsx
import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import Modal from "../../components/common/Modal/Modal";
import "./ServiceTracker.css";

// GraphQL query to get all project services with their related services in progress
const GET_ALL_PROJECT_SERVICES = gql`
    query GetAllProjectServices {
        projectServices {
            id
            amount
            service {
                id
                serviceName
                estimateCost
                serviceType {
                    id
                    name
                }
            }
            project {
                id
                name
                client {
                    name
                }
                status {
                    name
                }
            }
            servicesInProgress {
                id
                startDate
                endDate
                cost
                status {
                    id
                    name
                }
            }
        }
    }
`;

// Mutation to create a new service in progress
const CREATE_SERVICE_IN_PROGRESS = gql`
    mutation CreateServiceInProgress($input: CreateServiceInProgressInput!) {
        createServiceInProgress(input: $input) {
            id
            startDate
            endDate
            cost
            status {
                id
                name
            }
        }
    }
`;

// Mutation to create a new task
const CREATE_TASK = gql`
    mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
            id
            name
            description
            deadline
            priority
            value
        }
    }
`;

// Query to get service statuses for the dropdown
const GET_SERVICE_STATUSES = gql`
    query GetServiceStatuses {
        serviceStatuses {
            id
            name
        }
    }
`;

// Query to get workers for task assignment dropdown
const GET_WORKERS = gql`
    query GetWorkers {
        workers {
            id
            name
            surname
            mainRole
        }
    }
`;

export default function ServiceTracker() {
    const [selectedService, setSelectedService] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filters, setFilters] = useState({
        onlyMismatched: true,
        searchQuery: "",
        projectFilter: ""
    });

    // Fetch all project services
    const { data, loading, error, refetch } = useQuery(GET_ALL_PROJECT_SERVICES);

    // Fetch service statuses for creating new service in progress
    const { data: statusesData } = useQuery(GET_SERVICE_STATUSES);

    // Fetch workers for task assignment
    const { data: workersData } = useQuery(GET_WORKERS);

    // Create service in progress mutation
    const [createServiceInProgress, { loading: creating }] = useMutation(CREATE_SERVICE_IN_PROGRESS);

    // Create task mutation
    const [createTask] = useMutation(CREATE_TASK);

    // Handle filtering of services
    const getFilteredServices = () => {
        if (!data || !data.projectServices) return [];

        return data.projectServices.filter(ps => {
            // Filter by search query (service name or project name)
            const matchesSearch = filters.searchQuery
                ? (ps.service.serviceName.toLowerCase().includes(filters.searchQuery.toLowerCase())
                    || ps.project.name.toLowerCase().includes(filters.searchQuery.toLowerCase()))
                : true;

            // Filter by project name if specified
            const matchesProject = filters.projectFilter
                ? ps.project.name.toLowerCase().includes(filters.projectFilter.toLowerCase())
                : true;

            // Filter by mismatch if enabled
            const isMismatched = filters.onlyMismatched
                ? ps.amount > ps.servicesInProgress.length
                : true;

            return matchesSearch && matchesProject && isMismatched;
        });
    };

    // Create a new service in progress with tasks
    const handleCreateServiceInProgress = async (formData) => {
        try {
            // First create the service in progress
            const { data: sipData } = await createServiceInProgress({
                variables: {
                    input: {
                        projectServiceId: parseInt(selectedService.id),
                        statusId: parseInt(formData.statusId),
                        startDate: formData.startDate,
                        endDate: formData.endDate || null,
                        cost: formData.cost ? parseFloat(formData.cost) : null
                    }
                }
            });

            const newServiceInProgressId = sipData.createServiceInProgress.id;

            // Then create tasks if they exist
            if (formData.tasks && formData.tasks.length > 0) {
                for (const task of formData.tasks) {
                    if (task.name && task.deadline && task.assignedWorkerId) {
                        await createTask({
                            variables: {
                                input: {
                                    name: task.name,
                                    description: task.description || null,
                                    deadline: task.deadline,
                                    serviceInProgressId: newServiceInProgressId,
                                    assignedWorkerId: parseInt(task.assignedWorkerId),
                                    priority: task.priority ? parseInt(task.priority) : null,
                                    value: task.value ? parseFloat(task.value) : null
                                }
                            }
                        });
                    }
                }
            }

            setShowCreateModal(false);
            refetch();
        } catch (err) {
            console.error("Error creating service in progress:", err);
        }
    };

    // Calculate service progress percentage
    const calculateProgress = (ps) => {
        if (ps.amount === 0) return 100;
        return Math.round((ps.servicesInProgress.length / ps.amount) * 100);
    };

    // Get missing count
    const getMissingCount = (ps) => {
        return ps.amount - ps.servicesInProgress.length;
    };

    const filteredServices = getFilteredServices();

    return (
        <div className="service-tracker-container">
            <div className="page-header">
                <h1>Service Implementation Tracker</h1>
                <p className="subheading">Track planned services vs. actual implementations</p>
            </div>

            <div className="filter-bar">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by service or project name..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                        className="search-input"
                    />
                    {filters.searchQuery && (
                        <button
                            className="clear-search"
                            onClick={() => setFilters(prev => ({ ...prev, searchQuery: "" }))}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="filter-options">
                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={filters.onlyMismatched}
                            onChange={(e) => setFilters(prev => ({ ...prev, onlyMismatched: e.target.checked }))}
                        />
                        <span>Show only services with missing implementations</span>
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="loading-message">Loading services...</div>
            ) : error ? (
                <div className="error-message">Error loading services: {error.message}</div>
            ) : (
                <>
                    {filteredServices.length === 0 ? (
                        <Card className="empty-state-card">
                            <div className="no-services-message">
                                {filters.searchQuery || filters.projectFilter ?
                                    "No services match your search criteria." :
                                    "All services have been fully implemented."}
                            </div>
                        </Card>
                    ) : (
                        <div className="services-grid">
                            {filteredServices.map(ps => (
                                <Card
                                    key={ps.id}
                                    className={`service-card ${ps.servicesInProgress.length < ps.amount ? 'incomplete' : 'complete'}`}
                                >
                                    <div className="service-header">
                                        <h3 className="service-name">{ps.service.serviceName}</h3>
                                        <Badge
                                            variant={ps.servicesInProgress.length < ps.amount ? 'warning' : 'success'}
                                        >
                                            {ps.servicesInProgress.length} / {ps.amount}
                                        </Badge>
                                    </div>

                                    <div className="service-project">
                                        <span className="label">Project:</span>
                                        <span className="value">{ps.project.name}</span>
                                    </div>

                                    <div className="service-client">
                                        <span className="label">Client:</span>
                                        <span className="value">{ps.project.client.name}</span>
                                    </div>

                                    <div className="service-type">
                                        <span className="label">Type:</span>
                                        <span className="value">{ps.service.serviceType.name}</span>
                                    </div>

                                    <div className="service-cost">
                                        <span className="label">Est. Cost:</span>
                                        <span className="value">${parseFloat(ps.service.estimateCost).toFixed(2)}</span>
                                    </div>

                                    <div className="progress-container">
                                        <div className="progress-label">
                                            <span>Implementation Progress</span>
                                            <span>{calculateProgress(ps)}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${calculateProgress(ps)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {getMissingCount(ps) > 0 && (
                                        <div className="service-actions">
                                            <Button
                                                variant="primary"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedService(ps);
                                                    setShowCreateModal(true);
                                                }}
                                            >
                                                Create Service Implementation ({getMissingCount(ps)} missing)
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Create Service In Progress Modal with Tasks */}
            {showCreateModal && selectedService && (
                <CreateServiceInProgressModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleCreateServiceInProgress}
                    statuses={statusesData?.serviceStatuses || []}
                    workers={workersData?.workers || []}
                    projectService={selectedService}
                />
            )}
        </div>
    );
}

// Modal component for creating a new service implementation with tasks
function CreateServiceInProgressModal({ isOpen, onClose, onSave, statuses, workers, projectService }) {
    const [serviceForm, setServiceForm] = useState({
        statusId: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        cost: projectService?.service?.estimateCost || ""
    });

    const [tasks, setTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [editingTaskIndex, setEditingTaskIndex] = useState(-1);

    const handleServiceFormChange = (e) => {
        const { name, value } = e.target;
        setServiceForm(prev => ({ ...prev, [name]: value }));
    };

    const openAddTaskModal = () => {
        setCurrentTask({
            name: "",
            description: "",
            deadline: new Date().toISOString().split("T")[0],
            assignedWorkerId: "",
            priority: "5",
            value: ""
        });
        setEditingTaskIndex(-1);
        setShowTaskModal(true);
    };

    const openEditTaskModal = (index) => {
        setCurrentTask({...tasks[index]});
        setEditingTaskIndex(index);
        setShowTaskModal(true);
    };

    const handleTaskSave = () => {
        if (editingTaskIndex >= 0) {
            // Edit existing task
            const updatedTasks = [...tasks];
            updatedTasks[editingTaskIndex] = currentTask;
            setTasks(updatedTasks);
        } else {
            // Add new task
            setTasks(prev => [...prev, currentTask]);
        }
        setShowTaskModal(false);
    };

    const handleRemoveTask = (index) => {
        setTasks(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...serviceForm,
            tasks
        });
    };

    // Helper function to get worker name
    const getWorkerName = (workerId) => {
        const worker = workers.find(w => w.id === workerId);
        return worker ? `${worker.name} ${worker.surname}` : "Unknown";
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Service Implementation with Tasks"
            size="large"
        >
            <form onSubmit={handleSubmit} className="service-form">
                <div className="form-section">
                    <h3 className="section-title">Service Implementation Details</h3>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Service</label>
                            <input
                                type="text"
                                className="form-control"
                                value={projectService?.service?.serviceName || ""}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Project</label>
                            <input
                                type="text"
                                className="form-control"
                                value={projectService?.project?.name || ""}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status *</label>
                            <select
                                name="statusId"
                                value={serviceForm.statusId}
                                onChange={handleServiceFormChange}
                                className="form-control"
                                required
                            >
                                <option value="">Select status</option>
                                {statuses.map(status => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Start Date *</label>
                            <input
                                type="date"
                                name="startDate"
                                value={serviceForm.startDate}
                                onChange={handleServiceFormChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={serviceForm.endDate}
                                onChange={handleServiceFormChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Cost</label>
                            <input
                                type="number"
                                name="cost"
                                value={serviceForm.cost}
                                onChange={handleServiceFormChange}
                                className="form-control"
                                step="0.01"
                                placeholder="Enter cost..."
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section tasks-section">
                    <div className="section-header">
                        <h3 className="section-title">Tasks</h3>
                        <Button
                            variant="primary"
                            size="small"
                            type="button"
                            onClick={openAddTaskModal}
                        >
                            + Add Task
                        </Button>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="no-tasks-message">
                            No tasks added yet. Click the "Add Task" button to create tasks for this service implementation.
                        </div>
                    ) : (
                        <div className="tasks-list">
                            {tasks.map((task, index) => (
                                <div key={index} className="task-list-item">
                                    <div className="task-info">
                                        <div className="task-name">{task.name}</div>
                                        <div className="task-details">
                      <span className="task-detail">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">{new Date(task.deadline).toLocaleDateString()}</span>
                      </span>
                                            <span className="task-detail">
                        <span className="detail-label">Assigned to:</span>
                        <span className="detail-value">{getWorkerName(task.assignedWorkerId)}</span>
                      </span>
                                            {task.priority && (
                                                <span className="task-detail">
                          <span className="detail-label">Priority:</span>
                          <span className="detail-value">{task.priority}</span>
                        </span>
                                            )}
                                        </div>
                                        {task.description && (
                                            <div className="task-description">{task.description}</div>
                                        )}
                                    </div>
                                    <div className="task-actions">
                                        <Button
                                            variant="outline"
                                            size="small"
                                            type="button"
                                            onClick={() => openEditTaskModal(index)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="small"
                                            type="button"
                                            onClick={() => handleRemoveTask(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!serviceForm.statusId || !serviceForm.startDate}
                    >
                        Create Service Implementation
                    </Button>
                </div>
            </form>

            {/* Task Edit/Add Modal */}
            {showTaskModal && (
                <Modal
                    isOpen={showTaskModal}
                    onClose={() => setShowTaskModal(false)}
                    title={editingTaskIndex >= 0 ? "Edit Task" : "Add Task"}
                    size="medium"
                >
                    <div className="task-form">
                        <div className="form-group">
                            <label className="form-label">Task Name *</label>
                            <input
                                type="text"
                                value={currentTask.name}
                                onChange={(e) => setCurrentTask(prev => ({...prev, name: e.target.value}))}
                                className="form-control"
                                placeholder="Enter task name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                value={currentTask.description}
                                onChange={(e) => setCurrentTask(prev => ({...prev, description: e.target.value}))}
                                className="form-control"
                                placeholder="Enter task description"
                                rows="3"
                            />
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Deadline *</label>
                                <input
                                    type="date"
                                    value={currentTask.deadline}
                                    onChange={(e) => setCurrentTask(prev => ({...prev, deadline: e.target.value}))}
                                    className="form-control"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Assign To *</label>
                                <select
                                    value={currentTask.assignedWorkerId}
                                    onChange={(e) => setCurrentTask(prev => ({...prev, assignedWorkerId: e.target.value}))}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Select worker</option>
                                    {workers.map(worker => (
                                        <option key={worker.id} value={worker.id}>
                                            {worker.name} {worker.surname}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Priority (1-10)</label>
                                <input
                                    type="number"
                                    value={currentTask.priority}
                                    onChange={(e) => setCurrentTask(prev => ({...prev, priority: e.target.value}))}
                                    className="form-control"
                                    min="1"
                                    max="10"
                                    placeholder="5"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Value</label>
                                <input
                                    type="number"
                                    value={currentTask.value}
                                    onChange={(e) => setCurrentTask(prev => ({...prev, value: e.target.value}))}
                                    className="form-control"
                                    step="0.01"
                                    placeholder="Enter value..."
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setShowTaskModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="button"
                                onClick={handleTaskSave}
                                disabled={!currentTask.name || !currentTask.deadline || !currentTask.assignedWorkerId}
                            >
                                {editingTaskIndex >= 0 ? "Save Changes" : "Add Task"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Modal>
    );
}