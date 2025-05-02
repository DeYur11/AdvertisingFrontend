import { useState } from "react";
import { useQuery, gql, ApolloClient, InMemoryCache } from "@apollo/client";
import "./ProjectManagement.css";

// Components
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";

// GraphQL query to fetch projects without detailed task data
const GET_PROJECTS = gql`
    query GetProjects {
        projects {
            id
            name
            registrationDate
            startDate
            endDate
            cost
            estimateCost
            status {
                id
                name
            }
            projectType {
                id
                name
            }
            paymentDeadline
            client {
                id
                name
            }
            manager {
                id
                name
                surname
            }
            description
            projectServices {
                id
                amount
                service {
                    id
                    serviceName
                    duration
                    estimateCost
                    serviceType {
                        id
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
    }
`;

// GraphQL query to fetch detailed task data for a specific service in progress
const GET_SERVICE_TASKS = gql`
    query GetServiceTasks($serviceInProgressId: ID!) {
        serviceInProgress(id: $serviceInProgressId) {
            id
            tasks {
                id
                name
                description
                priority
                startDate
                endDate
                deadline
                taskStatus {
                    id
                    name
                }
            }
        }
    }
`;

export default function ProjectManagement() {
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [expandedServiceId, setExpandedServiceId] = useState(null);
    const [selectedServiceInProgressId, setSelectedServiceInProgressId] = useState(null);
    const [tasksData, setTasksData] = useState({});
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Fetch projects data
    const { loading, error, data } = useQuery(GET_PROJECTS);

    // Function to fetch task data for a specific service in progress
    const fetchTasksData = async (serviceInProgressId) => {
        if (tasksData[serviceInProgressId]) return; // Skip if already loaded

        setLoadingTasks(true);
        try {
            // Using Apollo client directly for more control
            const client = new ApolloClient({
                uri: process.env.REACT_APP_API_URL || 'http://localhost:8080/graphql',
                cache: new InMemoryCache(),
            });

            const response = await client.query({
                query: GET_SERVICE_TASKS,
                variables: { serviceInProgressId }
            });

            // Update tasks data state with the fetched tasks
            setTasksData(prev => ({
                ...prev,
                [serviceInProgressId]: response.data.serviceInProgress.tasks
            }));
        } catch (err) {
            console.error("Error fetching tasks:", err);
        } finally {
            setLoadingTasks(false);
        }
    };

    // Toggle project expansion
    const toggleProject = (id) => {
        setExpandedProjectId(prev => prev === id ? null : id);
        // Close any expanded service when toggling project
        setExpandedServiceId(null);
        setSelectedServiceInProgressId(null);
    };

    // Toggle service expansion
    const toggleService = (id, event) => {
        // Prevent project toggle when clicking on service
        event.stopPropagation();
        setExpandedServiceId(prev => prev === id ? null : id);
        setSelectedServiceInProgressId(null);
    };

    // Handle clicking on a service in progress to load its tasks
    const handleServiceInProgressClick = (serviceInProgressId, event) => {
        event.stopPropagation();
        setSelectedServiceInProgressId(serviceInProgressId);
        fetchTasksData(serviceInProgressId);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    // Format cost/currency
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "—";
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    // Calculate project completion percentage
    const calculateCompletion = (project) => {
        if (!project.projectServices || project.projectServices.length === 0) return 0;

        let completedServices = 0;
        let totalServices = 0;

        project.projectServices.forEach(ps => {
            if (ps.servicesInProgress && ps.servicesInProgress.length > 0) {
                ps.servicesInProgress.forEach(sip => {
                    totalServices++;
                    if (sip.status && sip.status.name.toLowerCase() === "completed") {
                        completedServices++;
                    }
                });
            }
        });

        return totalServices > 0 ? Math.floor((completedServices / totalServices) * 100) : 0;
    };

    // Count active and completed tasks for a specific service in progress
    const countTasks = (sipId) => {
        if (!tasksData[sipId]) return { active: 0, completed: 0, total: 0 };

        let active = 0;
        let completed = 0;
        const tasks = tasksData[sipId];

        tasks.forEach(task => {
            if (task.taskStatus) {
                if (task.taskStatus.name.toLowerCase() === "completed") {
                    completed++;
                } else {
                    active++;
                }
            }
        });

        return { active, completed, total: tasks.length };
    };

    return (
        <div className="project-management-container">
            <div className="page-header">
                <h1>Project Management</h1>
                <p className="subtitle">View and manage your projects</p>
            </div>

            {loading ? (
                <div className="loading-indicator">Loading projects...</div>
            ) : error ? (
                <div className="error-message">Error loading projects: {error.message}</div>
            ) : (
                <div className="projects-list">
                    {data && data.projects && data.projects.length > 0 ? (
                        data.projects.map(project => (
                            <Card
                                key={project.id}
                                className={`project-card ${expandedProjectId === project.id ? 'expanded' : ''}`}
                                onClick={() => toggleProject(project.id)}
                            >
                                <div className="project-header">
                                    <div className="project-title">
                                        <h2>{project.name}</h2>
                                        {project.status && (
                                            <Badge variant={
                                                project.status.name.toLowerCase() === "completed" ? "success" :
                                                    project.status.name.toLowerCase() === "in progress" ? "primary" :
                                                        "default"
                                            }>
                                                {project.status.name}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="project-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">Client:</span>
                                            <span className="meta-value">{project.client?.name || "—"}</span>
                                        </div>

                                        <div className="meta-item">
                                            <span className="meta-label">Project Type:</span>
                                            <span className="meta-value">{project.projectType?.name || "—"}</span>
                                        </div>

                                        <div className="meta-item">
                                            <span className="meta-label">Manager:</span>
                                            <span className="meta-value">
                        {project.manager ? `${project.manager.name} ${project.manager.surname}` : "—"}
                      </span>
                                        </div>
                                    </div>

                                    <div className="project-stats">
                                        <div className="stat-item">
                                            <div className="stat-value">{formatCurrency(project.estimateCost)}</div>
                                            <div className="stat-label">Estimated</div>
                                        </div>

                                        <div className="stat-item">
                                            <div className="stat-value">{formatCurrency(project.cost)}</div>
                                            <div className="stat-label">Actual</div>
                                        </div>

                                        <div className="stat-item">
                                            <div className="stat-value">{calculateCompletion(project)}%</div>
                                            <div className="stat-label">Completed</div>
                                        </div>
                                    </div>

                                    <div className="project-dates">
                                        <div className="date-item">
                                            <span className="date-label">Start:</span>
                                            <span className="date-value">{formatDate(project.startDate)}</span>
                                        </div>

                                        <div className="date-item">
                                            <span className="date-label">End:</span>
                                            <span className="date-value">{formatDate(project.endDate)}</span>
                                        </div>

                                        <div className="date-item">
                                            <span className="date-label">Payment Due:</span>
                                            <span className="date-value">{formatDate(project.paymentDeadline)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant={expandedProjectId === project.id ? "primary" : "outline"}
                                        icon={expandedProjectId === project.id ? "▲" : "▼"}
                                        size="small"
                                    >
                                        {expandedProjectId === project.id ? "Collapse" : "Expand"}
                                    </Button>
                                </div>

                                {/* Project Description - visible only when expanded */}
                                {expandedProjectId === project.id && project.description && (
                                    <div className="project-description">
                                        <h3>Description</h3>
                                        <p>{project.description}</p>
                                    </div>
                                )}

                                {/* Services List - visible only when expanded */}
                                {expandedProjectId === project.id && (
                                    <div className="services-section">
                                        <h3>Services</h3>

                                        {project.projectServices && project.projectServices.length > 0 ? (
                                            <div className="services-list">
                                                {project.projectServices.map(projectService => (
                                                    <Card
                                                        key={projectService.id}
                                                        className={`service-card ${expandedServiceId === projectService.id ? 'expanded' : ''}`}
                                                        onClick={(e) => toggleService(projectService.id, e)}
                                                    >
                                                        <div className="service-header">
                                                            <div className="service-title">
                                                                <h4>{projectService.service?.serviceName || "Unnamed Service"}</h4>
                                                                <Badge size="small">
                                                                    {projectService.service?.serviceType?.name || "—"}
                                                                </Badge>
                                                            </div>

                                                            <div className="service-meta">
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Duration:</span>
                                                                    <span className="meta-value">
                                    {projectService.service?.duration ? `${projectService.service.duration} days` : "—"}
                                  </span>
                                                                </div>

                                                                <div className="meta-item">
                                                                    <span className="meta-label">Estimated Cost:</span>
                                                                    <span className="meta-value">
                                    {formatCurrency(projectService.service?.estimateCost)}
                                  </span>
                                                                </div>

                                                                <div className="meta-item">
                                                                    <span className="meta-label">Amount:</span>
                                                                    <span className="meta-value">{projectService.amount || "—"}</span>
                                                                </div>
                                                            </div>

                                                            <div className="service-stats">
                                                                {projectService.servicesInProgress && (
                                                                    <div className="counter-badge">
                                                                        {projectService.servicesInProgress.length} orders
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <Button
                                                                variant={expandedServiceId === projectService.id ? "primary" : "outline"}
                                                                icon={expandedServiceId === projectService.id ? "▲" : "▼"}
                                                                size="small"
                                                                onClick={(e) => toggleService(projectService.id, e)}
                                                            >
                                                                {expandedServiceId === projectService.id ? "Hide Orders" : "Show Orders"}
                                                            </Button>
                                                        </div>

                                                        {/* Services in Progress - visible only when service is expanded */}
                                                        {expandedServiceId === projectService.id && projectService.servicesInProgress && (
                                                            <div className="services-in-progress-section">
                                                                <h5>Service Orders</h5>

                                                                {projectService.servicesInProgress.length > 0 ? (
                                                                    <div className="services-in-progress-list">
                                                                        {projectService.servicesInProgress.map(sip => {
                                                                            const taskCount = countTasks(sip);

                                                                            return (
                                                                                <Card
                                                                                    key={sip.id}
                                                                                    className={`service-in-progress-card ${selectedServiceInProgressId === sip.id ? 'selected' : ''}`}
                                                                                    onClick={(e) => handleServiceInProgressClick(sip.id, e)}
                                                                                >
                                                                                    <div className="sip-header">
                                                                                        <div className="sip-status">
                                                                                            <Badge
                                                                                                variant={
                                                                                                    sip.status?.name.toLowerCase() === "completed" ? "success" :
                                                                                                        sip.status?.name.toLowerCase() === "in progress" ? "primary" :
                                                                                                            "default"
                                                                                                }
                                                                                            >
                                                                                                {sip.status?.name || "Unknown"}
                                                                                            </Badge>
                                                                                        </div>

                                                                                        <div className="sip-dates">
                                                                                            <div className="date-item">
                                                                                                <span className="date-label">Start:</span>
                                                                                                <span className="date-value">{formatDate(sip.startDate)}</span>
                                                                                            </div>

                                                                                            <div className="date-item">
                                                                                                <span className="date-label">End:</span>
                                                                                                <span className="date-value">{formatDate(sip.endDate)}</span>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="sip-cost">
                                                                                            <span className="cost-label">Cost:</span>
                                                                                            <span className="cost-value">{formatCurrency(sip.cost)}</span>
                                                                                        </div>

                                                                                        <Button
                                                                                            variant={selectedServiceInProgressId === sip.id ? "primary" : "outline"}
                                                                                            size="small"
                                                                                            icon={selectedServiceInProgressId === sip.id ? "📃" : "📋"}
                                                                                            onClick={(e) => handleServiceInProgressClick(sip.id, e)}
                                                                                        >
                                                                                            {selectedServiceInProgressId === sip.id ? "Hide Tasks" : "View Tasks"}
                                                                                        </Button>
                                                                                    </div>

                                                                                    {/* Tasks list - loaded on demand */}
                                                                                    {selectedServiceInProgressId === sip.id && (
                                                                                        <div className="tasks-section">
                                                                                            <div className="tasks-header">
                                                                                                <h6>Tasks</h6>
                                                                                            </div>

                                                                                            {loadingTasks ? (
                                                                                                <div className="tasks-loading">Loading tasks...</div>
                                                                                            ) : tasksData[sip.id] && tasksData[sip.id].length > 0 ? (
                                                                                                <div className="tasks-list">
                                                                                                    {tasksData[sip.id].map(task => (
                                                                                                        <div key={task.id} className="task-item">
                                                                                                            <div className="task-header">
                                                                                                                <div className="task-name">{task.name}</div>
                                                                                                                <Badge
                                                                                                                    size="small"
                                                                                                                    variant={
                                                                                                                        task.taskStatus?.name.toLowerCase() === "completed" ? "success" :
                                                                                                                            task.taskStatus?.name.toLowerCase() === "in progress" ? "primary" :
                                                                                                                                "default"
                                                                                                                    }
                                                                                                                >
                                                                                                                    {task.taskStatus?.name || "Unknown"}
                                                                                                                </Badge>
                                                                                                            </div>

                                                                                                            {task.description && (
                                                                                                                <div className="task-description">
                                                                                                                    {task.description}
                                                                                                                </div>
                                                                                                            )}

                                                                                                            <div className="task-meta">
                                                                                                                {task.priority && (
                                                                                                                    <div className="meta-item">
                                                                                                                        <span className="meta-label">Priority:</span>
                                                                                                                        <span className="meta-value">{task.priority}</span>
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {task.deadline && (
                                                                                                                    <div className="meta-item">
                                                                                                                        <span className="meta-label">Deadline:</span>
                                                                                                                        <span className="meta-value">{formatDate(task.deadline)}</span>
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="no-items-message">
                                                                                                    No tasks found for this service.
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </Card>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="no-items-message">
                                                                        No service orders found for this service.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-items-message">
                                                No services found for this project.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))
                    ) : (
                        <div className="no-items-message">
                            No projects found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}