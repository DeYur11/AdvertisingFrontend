import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { useSelector } from "react-redux";
import "./EmployeeTasks.css";

// Правильний запит: workerId типу ID!
const GET_TASKS_BY_WORKER = gql`
  query GetTasksByWorker($workerId: ID!) {
    tasksByWorker(workerId: $workerId) {
      id
      name
      description
      startDate
      deadline
      taskStatus {
        name
      }
      priority
      value
      serviceInProgress {
        id
        startDate
        endDate
        cost
        status {
          name
        }
        projectService {
          project {
            id
            name
            startDate
            endDate
            description
            status {
              name
            }
            projectType {
              name
            }
            client {
              name
            }
          }
          service {
            id
            serviceName
            duration
            estimateCost
            serviceType {
              name
            }
          }
        }
      }
    }
  }
`;




export default function EmployeeTasks() {
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [taskFilter, setTaskFilter] = useState("active"); // "active" або "all"
    const [searchQuery, setSearchQuery] = useState("");

    const user = useSelector(state => state.user);
    const workerId = user.workerId;

    const { loading, error, data } = useQuery(GET_TASKS_BY_WORKER, {
        variables: { workerId: String(workerId) },
        skip: !workerId,
    });

    if (!workerId) return <p>No worker selected.</p>;
    if (loading) return <p>Loading tasks...</p>;
    if (error) return <p>Error loading tasks: {error.message}</p>;

    const tasksByWorker = data.tasksByWorker;

    const groupedProjects = {};

    tasksByWorker.forEach(task => {
        const project = task.serviceInProgress.projectService.project;
        const service = task.serviceInProgress.projectService.service;

        if (!groupedProjects[project.id]) {
            groupedProjects[project.id] = {
                ...project,
                services: {}
            };
        }

        if (!groupedProjects[project.id].services[service.id]) {
            groupedProjects[project.id].services[service.id] = {
                ...service,
                tasks: []
            };
        }

        groupedProjects[project.id].services[service.id].tasks.push(task);
    });

    const projectsArray = Object.values(groupedProjects);

    function toggleProject(id) {
        setExpandedProjectId(prev => (prev === id ? null : id));
    }

    function filterTasks(tasks) {
        if (taskFilter === "active") {
            return tasks.filter(task => {
                const status = task.taskStatus.name.toLowerCase();
                return status === "in progress" || status === "pending";
            });
        }
        return tasks;
    }

    function matchesSearch(text) {
        return text.toLowerCase().includes(searchQuery.trim().toLowerCase());
    }

    return (
        <div className="employee-tasks-container">

            {/* Панель фільтрів і пошуку */}
            <div className="task-filter-bar">
                <button
                    className={`filter-button ${taskFilter === "active" ? "active" : ""}`}
                    onClick={() => setTaskFilter("active")}
                >
                    Active Tasks
                </button>
                <button
                    className={`filter-button ${taskFilter === "all" ? "active" : ""}`}
                    onClick={() => setTaskFilter("all")}
                >
                    All Tasks
                </button>

                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by project, service, or task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Відображення проектів */}
            {projectsArray
                .map(project => {
                    const servicesWithFilteredTasks = Object.values(project.services)
                        .map(service => {
                            const filteredByActivity = filterTasks(service.tasks);

                            const finalFilteredTasks = filteredByActivity.filter(task =>
                                matchesSearch(task.name)
                            );

                            const serviceMatchesSearch = matchesSearch(service.serviceName);

                            if (serviceMatchesSearch || finalFilteredTasks.length > 0) {
                                return {
                                    ...service,
                                    filteredTasks: finalFilteredTasks
                                };
                            }
                            return null;
                        })
                        .filter(service => service !== null);

                    const projectMatchesSearch = matchesSearch(project.name);

                    if (servicesWithFilteredTasks.length === 0 && !projectMatchesSearch) {
                        return null;
                    }

                    return (
                        <div key={project.id} className="project-section">
                            <div className="project-header" onClick={() => toggleProject(project.id)}>
                                <div>
                                    {project.name}
                                    <div className="project-info">
                                        {project.projectType?.name} — {project.status?.name} — Client: {project.client?.name}
                                    </div>
                                </div>
                                <div className={`toggle-icon ${expandedProjectId === project.id ? "expanded" : ""}`}>
                                    {expandedProjectId === project.id ? "▲" : "▼"}
                                </div>
                            </div>

                            {expandedProjectId === project.id && (
                                <div className="services-grid">
                                    {servicesWithFilteredTasks.map(service => (
                                        <div key={service.id} className="service-card">
                                            <div className="service-name">{service.serviceName}</div>
                                            <div className="tasks-list">
                                                {service.filteredTasks.map(task => (
                                                    <div key={task.id} className="task-item">
                                                        ➔ {task.name}{" "}
                                                        <span className={`task-status ${task.taskStatus.name.toLowerCase()}`}>
                              {task.taskStatus.name}
                            </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            }
        </div>
    );
}


