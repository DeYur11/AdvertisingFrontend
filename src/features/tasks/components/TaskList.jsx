import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import TaskFilterBar from "./TaskFilterBar/TaskFilterBar";
import Modal from "../../../components/common/Modal/Modal";
import TaskDetails from "./details/TaskDetails/TaskDetails";
import ServiceDetails from "./details/ServiceDetails/ServiceDetails";
import Button from "../../../components/common/Button/Button";
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

    const user = useSelector(state => state.user);
    const workerId = user.workerId;

    const { loading, error, data } = useQuery(GET_TASKS_BY_WORKER, {
        variables: { workerId: String(workerId) },
        skip: !workerId,
    });

    // Helper function to create breadcrumbs info
    const getBreadcrumbInfo = (type, data) => {
        if (type === "service") {
            // Find corresponding project
            const projectName = Object.values(groupedProjects).find(
                project => project.services.some(s => s.id === data.id)
            )?.name || "Unknown Project";

            return {
                project: projectName,
                service: data.serviceName
            };
        } else if (type === "task") {
            // Find corresponding project and service
            let projectName = "Unknown Project";
            let serviceName = "Unknown Service";

            Object.values(groupedProjects).forEach(project => {
                project.services.forEach(service => {
                    if (service.tasks.some(t => t.id === data.id)) {
                        projectName = project.name;
                        serviceName = service.serviceName;
                    }
                });
            });

            return {
                project: projectName,
                service: serviceName,
                task: data.name
            };
        }

        return {};
    };

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
            .filter(project => project !== null);
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
            .filter(project => project !== null);
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
                <TaskFilterBar
                    taskFilter={taskFilter}
                    setTaskFilter={setTaskFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {visibleProjects.length > 0 ? (
                    <div className="projects-list">
                        {visibleProjects.map(project => (
                            <CompactProjectCard
                                key={project.id}
                                project={project}
                                expanded={expandedProjectId === project.id}
                                onToggle={() => toggleProject(project.id)}
                                services={project.servicesList || Object.values(project.services)}
                                searchQuery={searchQuery}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="empty-state-card">
                        <div className="no-projects-message">
                            {searchQuery
                                ? `No projects found matching "${searchQuery}"`
                                : "No active projects found"}
                        </div>
                    </Card>
                )}
            </div>

            {/* Modal for task/service details instead of sidebar */}
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