import {useEffect, useState} from "react";
import { useQuery, gql } from "@apollo/client";
import { useSelector } from "react-redux";
import Card from "../../../../components/common/Card/Card";
import Pagination from "../../../../components/common/Pagination/Pagination";
import TaskFilterPanel from "../TaskFilterPanel/TaskFilterPanel";
import ProjectCard from "../ProjectCard/ProjectCard";
import Modal from "../../../../components/common/Modal/Modal";
import TaskDetailsModal from "../details/TaskDetailsModal/TaskDetailsModal";
import "./TaskList.css";

// GraphQL query for paginated tasks
const GET_PAGINATED_TASKS_BY_WORKER = gql`
    query GetPaginatedTasksByWorker($workerId: ID!, $input: PaginatedTasksInput!) {
        paginatedTasksByWorker(workerId: $workerId, input: $input) {
            content {
                id
                name
                description
                startDate
                deadline
                endDate
                priority
                value
                taskStatus {
                    id
                    name
                }
                serviceInProgress {
                    id
                    startDate
                    endDate
                    cost
                    status {
                        name
                    }
                    projectService {
                        service {
                            id
                            serviceName
                            estimateCost
                            serviceType {
                                name
                            }
                        }
                        project {
                            id
                            name
                            startDate
                            endDate
                            status {
                                name
                            }
                            projectType {
                                name
                            }
                            client {
                                name
                            }
                            manager {
                                name
                                surname
                            }
                        }
                    }
                }
            }
            pageInfo {
                totalElements
                totalPages
                size
                number
                first
                last
                numberOfElements
            }
        }
    }
`;


const ACTIVE_TASK_STATUS_IDS = [1, 2, 4]

export default function TaskList({
                                     pageState,
                                     updatePageState,
                                     updateFilterState,
                                     handleSearchChange,
                                     clearAllFilters
                                 }) {
    const user = useSelector(state => state.user);
    const workerId = user.workerId;

    // State for expanded project, task details modal, and filter panel
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);
    const [activeProject, setActiveProject] = useState(null);
    const [activeService, setActiveService] = useState(null);
    const [viewMode, setViewMode] = useState("active"); // "active" or "all"


    // Execute GraphQL query
    const { loading, error, data, refetch} = useQuery(GET_PAGINATED_TASKS_BY_WORKER, {
        variables: {
            workerId: String(workerId),
            input: {
                page: Number(pageState.page),  // Ensure it's a number
                size: Number(pageState.size),  // Ensure it's a number
                sortField: pageState.sortField,
                sortDirection: pageState.sortDirection,
                filter: {
                    ...pageState.filter,
                    // Convert all IDs in arrays to numbers
                    statusIds: pageState.filter.statusIds?.map(id => Number(id)) ||
                        // Add default status IDs for "active" view if no status filter
                        (viewMode === "active" && (!pageState.filter.statusIds || pageState.filter.statusIds.length === 0)
                            ? [1, 2, 4] // ID 1 for "in progress", ID 3 for "pending" (adjust as needed)
                            : undefined),
                    priorityIn: pageState.filter.priorityIn?.map(p => Number(p)) || undefined,
                    serviceInProgressIds: pageState.filter.serviceInProgressIds?.map(id => Number(id)) || undefined
                }
            }
        },
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        if (
            viewMode === "active" &&
            (!pageState.filter.statusIds || pageState.filter.statusIds.length === 0)
        ) {
            updateFilterState({ statusIds: ACTIVE_TASK_STATUS_IDS });
        }
    }, []);

    useEffect(() => {
        let variables = { // Створіть об'єкт змінних окремо
            workerId: String(workerId),
            input: {
                page: Number(pageState.page),
                size: Number(pageState.size),
                sortField: pageState.sortField,
                sortDirection: pageState.sortDirection,
                filter: {
                    // ... логіка формування filter ...
                    statusIds: (
                        pageState.filter.statusIds && pageState.filter.statusIds.length > 0
                            ? pageState.filter.statusIds.map(id => Number(id))
                            : viewMode === "active"
                                ? ACTIVE_TASK_STATUS_IDS // Використовуйте константу
                                : undefined
                    ),
                    // ... інші фільтри ...
                }
            }
        };
        console.log(variables)
        refetch()
    }, [refetch, viewMode]);

    console.log("Current viewMode:", viewMode);
    console.log("Current pageState.filter.statusIds:", pageState.filter.statusIds);

    if (!workerId) return <div className="no-worker-message">No worker selected.</div>;
    if (loading) return <div className="loading-message">Loading tasks...</div>;
    if (error) return <div className="error-message">Error loading tasks: {error.message}</div>;

    const { content: tasks, pageInfo } = data.paginatedTasksByWorker;

    // Group tasks by project and service
    const groupedProjects = {};

    tasks.forEach(task => {
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
                projectId: project.id
            };

            // Add to the services list
            groupedProjects[project.id].servicesList.push(groupedProjects[project.id].services[service.id]);
        }

        groupedProjects[project.id].services[service.id].tasks.push({
            ...task,
            serviceId: service.id,
            projectId: project.id
        });
    });

    const projectsArray = Object.values(groupedProjects);

    function toggleProject(id) {
        setExpandedProjectId(prev => (prev === id ? null : id));
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

    function handlePageChange(newPage) {
        // Note: newPage is 1-based but the API expects 0-based
        // Ensure we're passing a number, not a string
        updatePageState({ page: Number(newPage) - 1 });
    }

    function handlePageSizeChange(newSize) {
        updatePageState({
            page: 0,  // Reset to first page
            size: Number(newSize) // Ensure it's a number
        });
    }

    function handleSortChange(field, direction) {
        updatePageState({
            sortField: field,
            sortDirection: direction
        });
    }

    function handleViewModeChange(mode) {
        setViewMode(mode);
        if(viewMode === "active") {
            updateFilterState({ statusIds: [] });
        }else{
            updateFilterState({
                statusIds: ACTIVE_TASK_STATUS_IDS
            })
        }
    }

    // Generate modal title
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
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    searchQuery={pageState.filter.nameContains || ""}
                    onSearchChange={handleSearchChange}
                    filters={pageState.filter}
                    onFiltersChange={updateFilterState}
                    expanded={filterPanelExpanded}
                    setExpanded={setFilterPanelExpanded}
                    onSortChange={handleSortChange}
                    currentSortField={pageState.sortField}
                    currentSortDirection={pageState.sortDirection}
                    onClearAllFilters={clearAllFilters}
                />

                {projectsArray.length > 0 ? (
                    <div className="projects-list">
                        {projectsArray.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                expanded={expandedProjectId === project.id}
                                onToggle={() => toggleProject(project.id)}
                                services={project.servicesList}
                                searchQuery={pageState.filter.nameContains || ""}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="empty-state-card">
                        <div className="no-projects-message">
                            {(pageState.filter.nameContains || Object.values(pageState.filter).some(f =>
                                Array.isArray(f) ? f.length > 0 : f !== null && f !== ""))
                                ? "No tasks match your current filters. Try adjusting your search or filters."
                                : "No active tasks found"}
                        </div>
                    </Card>
                )}

                {/* Pagination controls */}
                {pageInfo.totalPages > 0 && (
                    <Pagination
                        currentPage={pageInfo.number + 1} // API returns 0-based, UI needs 1-based
                        totalPages={pageInfo.totalPages}
                        onPageChange={handlePageChange}
                        pageSize={pageInfo.size}
                        onPageSizeChange={handlePageSizeChange}
                        totalItems={pageInfo.totalElements}
                    />
                )}
            </div>

            {/* Modal for task/service details */}
            <TaskDetailsModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                selectedItem={selectedItem}
                activeProject={activeProject}
                activeService={activeService}
            />
        </div>
    );
}