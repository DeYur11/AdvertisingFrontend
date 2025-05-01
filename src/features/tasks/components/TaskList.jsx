import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import TaskFilterPanel from "./TaskFilterPanel/TaskFilterPanel";
import Modal from "../../../components/common/Modal/Modal";
import TaskDetails from "./details/TaskDetails/TaskDetails";
import ServiceDetails from "./details/ServiceDetails/ServiceDetails";
import Card from "../../../components/common/Card/Card";
import "./TaskList.css";
import {
    ProjectNameMatchHandler,
    ActiveTaskExistenceHandler,
    ServiceNameMatchHandler,
    ActiveServiceExistenceHandler
} from "../../../utils/filterHandlers";
import { GET_TASKS_BY_WORKER } from "../graphql/queries";
import CompactProjectCard from "./CompactProjectCard/CompactProjectCard";

export default function TaskList() {
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [taskFilter, setTaskFilter] = useState("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeProject, setActiveProject] = useState(null);
    const [activeService, setActiveService] = useState(null);
    const [advancedFilters, setAdvancedFilters] = useState({});
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);

    const user = useSelector(state => state.user);
    const workerId = user.workerId;

    const { loading, error, data } = useQuery(GET_TASKS_BY_WORKER, {
        variables: { workerId: String(workerId) },
        skip: !workerId,
    });

    if (!workerId) return <div className="no-worker-message">No worker selected.</div>;
    if (loading) return <div className="loading-message">Loading tasks...</div>;
    if (error) return <div className="error-message">Error loading tasks: {error.message}</div>;

    const tasksByWorker = data.tasksByWorker;

    // Group tasks by project and service
    const groupedProjects = {};

    tasksByWorker.forEach(task => {
        const project = task.serviceInProgress.projectService.project;
        const service = task.serviceInProgress.projectService.service;

        if (!groupedProjects[project.id]) {
            groupedProjects[project.id] = {
                ...project,
                services: {},
                servicesList: [] // For easier access
            };
        }

        if (!groupedProjects[project.id].services[service.id]) {
            groupedProjects[project.id].services[service.id] = {
                ...service,
                tasks: [],
                projectId: project.id // Store reference to parent project
            };

            // Add to the services list
            groupedProjects[project.id].servicesList.push(groupedProjects[project.id].services[service.id]);
        }

        groupedProjects[project.id].services[service.id].tasks.push({
            ...task,
            serviceId: service.id, // Store reference to parent service
            projectId: project.id  // Store reference to parent project
        });
    });

    const projectsArray = Object.values(groupedProjects);

    function toggleProject(id) {
        setExpandedProjectId(prev => (prev === id ? null : id));
    }

    function getVisibleProjectsForActiveTasks(projectsArray) {
        const chain = new ProjectNameMatchHandler(
            searchQuery,
            new ActiveTaskExistenceHandler(
                new ActiveServiceExistenceHandler(searchQuery, null)
            )
        );

        return projectsArray
            .map(project => chain.handle(project))
            .filter(project => project !== null)
            .filter(project => applyAdvancedFilters(project));
    }

    function getVisibleProjectsForAllTasks(projectsArray) {
        const chain = new ProjectNameMatchHandler(
            searchQuery,
            new ServiceNameMatchHandler(
                searchQuery,
                null
            )
        );

        return projectsArray
            .map(project => chain.handle(project))
            .filter(project => project !== null)
            .filter(project => applyAdvancedFilters(project));
    }

    // Function to apply advanced filters
    function applyAdvancedFilters(project) {
        // If no advanced filters are set, return true (include all projects)
        if (Object.keys(advancedFilters).length === 0) {
            return true;
        }

        // Apply project type filter if set
        if (advancedFilters.projectType && advancedFilters.projectType.length > 0) {
            const projectTypeName = project.projectType?.name || "";
            if (!advancedFilters.projectType.includes(projectTypeName)) {
                return false;
            }
        }

        // Apply client filter if set
        if (advancedFilters.clientId && advancedFilters.clientId.length > 0) {
            const clientId = project.client?.id;
            if (!advancedFilters.clientId.includes(clientId)) {
                return false;
            }
        }

        // Create a modified project with only filtered services
        const filteredProject = {
            ...project,
            services: []
        };

        // Filter services and tasks based on advanced filters
        const filteredServices = project.services.filter(service => {
            // Apply service type filter if set
            if (advancedFilters.serviceType && advancedFilters.serviceType.length > 0) {
                const serviceTypeName = service.serviceType?.name || "";
                if (!advancedFilters.serviceType.includes(serviceTypeName)) {
                    return false;
                }
            }

            // Filter tasks within each service
            const filteredTasks = service.filteredTasks ? service.filteredTasks.filter(task => {
                // Apply status filter
                if (advancedFilters.status && advancedFilters.status.length > 0) {
                    const taskStatusName = task.taskStatus?.name?.toLowerCase() || "";
                    if (!advancedFilters.status.includes(taskStatusName)) {
                        return false;
                    }
                }

                // Apply priority filter
                if (advancedFilters.priority && advancedFilters.priority.length > 0) {
                    const priority = parseInt(task.priority || "0");
                    const priorityCategory =
                        priority >= 8 ? "high" :
                            priority >= 4 ? "medium" :
                                "low";

                    if (!advancedFilters.priority.includes(priorityCategory)) {
                        return false;
                    }
                }

                // Apply deadline filter
                if (advancedFilters.deadline) {
                    const taskDeadline = task.deadline ? new Date(task.deadline) : null;

                    if (taskDeadline) {
                        // Format dates for comparison (YYYY-MM-DD)
                        const deadlineDate = taskDeadline.toISOString().split('T')[0];

                        if (advancedFilters.deadline.from && deadlineDate < advancedFilters.deadline.from) {
                            return false;
                        }

                        if (advancedFilters.deadline.to && deadlineDate > advancedFilters.deadline.to) {
                            return false;
                        }
                    } else if (advancedFilters.deadline.from || advancedFilters.deadline.to) {
                        // If deadline filter is active but task has no deadline
                        return false;
                    }
                }

                return true;
            }) : [];

            // Include service only if it has tasks after filtering
            if (filteredTasks.length > 0) {
                const filteredService = {
                    ...service,
                    filteredTasks: filteredTasks
                };

                filteredProject.services.push(filteredService);
                return true;
            }

            return false;
        });

        // Check if project has any services after filtering
        return filteredServices.length > 0;
    }

    function handleSelect(item) {
        if (item.type !== "project") {
            setSelectedItem(item);

            // Find and set parent items for breadcrumb navigation
            if (item.type === "service") {
                setActiveService(item.data);
                // Find parent project
                const parentProject = projectsArray.find(
                    p => Object.values(p.services).some(s => s.id === item.data.id)
                );
                setActiveProject(parentProject || null);
            } else if (item.type === "task") {
                // Find parent service
                let parentService = null;
                let parentProject = null;

                for (const project of projectsArray) {
                    for (const serviceId in project.services) {
                        const service = project.services[serviceId];
                        if (service.tasks.some(t => t.id === item.data.id)) {
                            parentService = service;
                            parentProject = project;
                            break;
                        }
                    }
                    if (parentService) break;
                }

                setActiveService(parentService);
                setActiveProject(parentProject);
            }

            setModalOpen(true);
        }
    }

    function handleCloseModal() {
        setModalOpen(false);
        setSelectedItem(null);
    }

    const visibleProjects = taskFilter === "active"
        ? getVisibleProjectsForActiveTasks(projectsArray)
        : getVisibleProjectsForAllTasks(projectsArray);

    // Determine modal title based on selected item
    let modalTitle = "";
    if (selectedItem) {
        if (selectedItem.type === "service") {
            modalTitle = `Service: ${selectedItem.data.serviceName}`;
        } else if (selectedItem.type === "task") {
            modalTitle = `Task: ${selectedItem.data.name}`;
        }
    }

    return (
        <div className="task-list-wrapper">
            <div className="task-list-container">
                <TaskFilterPanel
                    taskFilter={taskFilter}
                    setTaskFilter={setTaskFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filters={advancedFilters}
                    setFilters={setAdvancedFilters}
                    expanded={filterPanelExpanded}
                    setExpanded={setFilterPanelExpanded}
                />

                {visibleProjects.length > 0 ? (
                    <div className="projects-list">
                        {visibleProjects.map(project => (
                            <CompactProjectCard
                                key={project.id}
                                project={project}
                                expanded={expandedProjectId === project.id}
                                onToggle={() => toggleProject(project.id)}
                                services={project.services}
                                searchQuery={searchQuery}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="empty-state-card">
                        <div className="no-projects-message">
                            {searchQuery || Object.keys(advancedFilters).length > 0
                                ? "No tasks match your current filters. Try adjusting your search or filters."
                                : "No active projects found"}
                        </div>
                    </Card>
                )}
            </div>

            {/* Modal for task/service details */}
            <Modal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title={modalTitle}
                size="large"
                className="details-modal"
            >
                {selectedItem && (
                    <div className="details-container">
                        {/* Breadcrumb navigation */}
                        {(activeProject || activeService) && (
                            <div className="details-breadcrumbs">
                                {activeProject && (
                                    <span className="breadcrumb-item project">
                                        <span className="breadcrumb-label">Project:</span>
                                        <span className="breadcrumb-value">{activeProject.name}</span>
                                    </span>
                                )}

                                {activeProject && activeService && (
                                    <span className="breadcrumb-separator">›</span>
                                )}

                                {activeService && selectedItem.type === "task" && (
                                    <span className="breadcrumb-item service">
                                        <span className="breadcrumb-label">Service:</span>
                                        <span className="breadcrumb-value">{activeService.serviceName}</span>
                                    </span>
                                )}
                            </div>
                        )}

                        {selectedItem.type === "service" && <ServiceDetails data={selectedItem.data} />}
                        {selectedItem.type === "task" && <TaskDetails data={selectedItem.data} />}
                    </div>
                )}
            </Modal>
        </div>
    );
}