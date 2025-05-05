import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { useSelector } from "react-redux";
import FilterPanel from "../../../../components/common/FilterPanel/FilterPanel";
import Modal from "../../../../components/common/Modal/Modal";
import TaskDetails from "../details/TaskDetails/TaskDetails";
import ServiceDetails from "../details/ServiceDetails/ServiceDetails";
import Card from "../../../../components/common/Card/Card";
import Pagination from "../../../../components/common/Pagination/Pagination";
import ProjectCard from "../ProjectCard/ProjectCard";
import "./TaskList.css";

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
                taskStatus { id name }
                serviceInProgress {
                    id
                    projectService {
                        service {
                            id serviceName estimateCost serviceType { name }
                        }
                        project {
                            id name status { name } projectType { name } client { name } manager { name surname }
                        }
                    }
                }
            }
            pageInfo {
                totalElements totalPages size number
            }
        }
    }
`;

const GET_FILTER_REFERENCE_DATA = gql`
    query GetFilterReferenceData {
        projectTypes { id name }
        serviceTypes { id name }
        taskStatuses { id name }
        clients { id name }
    }
`;

const priorityOptions = [
    { value: "high", label: "High (8-10)" },
    { value: "medium", label: "Medium (4-7)" },
    { value: "low", label: "Low (1-3)" }
];

const taskFilterConfig = [
    {
        type: 'multi-select',
        key: 'statusIds',
        label: 'Task Status',
        optionsKey: 'taskStatuses',
        optionValue: 'id',
        optionLabel: 'name'
    },
    {
        type: 'multi-select',
        key: 'priority',
        label: 'Priority',
        options: priorityOptions
    },
    {
        type: 'date-range',
        key: 'deadline',
        fromKey: 'deadlineFrom',
        toKey: 'deadlineTo',
        label: 'Deadline',
        quickActions: [
            { label: "Next 7 days", days: 7 },
            { label: "Next 30 days", days: 30 },
            { label: "Overdue", days: "overdue" }
        ]
    },
    {
        type: 'multi-select',
        key: 'projectType',
        label: 'Project Type',
        optionsKey: 'projectTypes',
        optionValue: 'name',
        optionLabel: 'name'
    },
    {
        type: 'multi-select',
        key: 'serviceType',
        label: 'Service Type',
        optionsKey: 'serviceTypes',
        optionValue: 'name',
        optionLabel: 'name'
    }
];

const taskSortConfig = [
    { field: "NAME", label: "Name", defaultDirection: "ASC" },
    { field: "PRIORITY", label: "Priority", defaultDirection: "DESC" },
    { field: "DEADLINE", label: "Deadline", defaultDirection: "ASC" },
    { field: "CREATE_DATETIME", label: "Create Date", defaultDirection: "DESC" }
];

export default function TaskList() {
    const user = useSelector(state => state.user);
    const workerId = user.workerId;

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [sortState, setSortState] = useState({
        field: "DEADLINE",
        direction: "ASC"
    });

    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeProject, setActiveProject] = useState(null);
    const [activeService, setActiveService] = useState(null);

    const buildFilterInput = () => {
        const input = {};
        if (searchQuery) {
            input.nameContains = searchQuery;
            input.descriptionContains = searchQuery;
        }
        if (filters.statusIds?.length) input.statusIds = filters.statusIds.map(Number);
        if (filters.priority?.length) {
            const list = [];
            filters.priority.forEach(p => {
                if (p === "high") for (let i = 8; i <= 10; i++) list.push(i);
                if (p === "medium") for (let i = 4; i <= 7; i++) list.push(i);
                if (p === "low") for (let i = 1; i <= 3; i++) list.push(i);
            });
            input.priorityIn = list;
        }
        if (filters.deadline) {
            if (filters.deadline.from) input.deadlineFrom = filters.deadline.from;
            if (filters.deadline.to) input.deadlineTo = filters.deadline.to;
        }
        if (filters.serviceType?.length) {
            input.serviceTypeNames = filters.serviceType;
        }
        if (filters.projectType?.length) {
            input.projectTypeNames = filters.projectType;
        }
        if (filters.clientId?.length) {
            input.clientIds = filters.clientId.map(Number);
        }
        return input;
    };

    const { data, loading, error, refetch } = useQuery(GET_PAGINATED_TASKS_BY_WORKER, {
        variables: {
            workerId: String(workerId),
            input: {
                page: page - 1,
                size: pageSize,
                sortField: sortState.field,
                sortDirection: sortState.direction,
                filter: buildFilterInput()
            }
        },
        skip: !workerId,
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        if (workerId) {
            refetch({
                workerId: String(workerId),
                input: {
                    page: 0,
                    size: pageSize,
                    sortField: sortState.field,
                    sortDirection: sortState.direction,
                    filter: buildFilterInput()
                }
            });
            setPage(1);
        }
    }, [filters, searchQuery, sortState]);

    const groupTasksByProject = (tasks) => {
        const grouped = {};
        tasks.forEach(task => {
            const project = task.serviceInProgress?.projectService?.project;
            const service = task.serviceInProgress?.projectService?.service;
            if (!project || !service) return;

            if (!grouped[project.id]) {
                grouped[project.id] = { ...project, services: {}, servicesList: [] };
            }
            if (!grouped[project.id].services[service.id]) {
                grouped[project.id].services[service.id] = {
                    ...service,
                    tasks: [],
                    filteredTasks: [],
                    projectId: project.id
                };
                grouped[project.id].servicesList.push(grouped[project.id].services[service.id]);
            }
            const enriched = { ...task, serviceId: service.id, projectId: project.id };
            grouped[project.id].services[service.id].tasks.push(enriched);
            grouped[project.id].services[service.id].filteredTasks.push(enriched);
        });
        return Object.values(grouped);
    };

    const handleSortChange = (field, direction) => {
        setSortState({ field, direction });
    };

    const groupedProjects = groupTasksByProject(data?.paginatedTasksByWorker?.content || []);
    const pageInfo = data?.paginatedTasksByWorker?.pageInfo || {};

    return (
        <div className="task-list-wrapper">
            <div className="task-list-container">
                <FilterPanel
                    entityName="task"
                    filterConfig={taskFilterConfig}
                    sortConfig={taskSortConfig}
                    gqlQuery={GET_FILTER_REFERENCE_DATA}
                    searchConfig={{
                        placeholder: "Search tasks...",
                        value: searchQuery,
                        onChange: setSearchQuery
                    }}
                    filters={filters}
                    onFilterChange={setFilters}
                    onSortChange={handleSortChange}
                    currentSort={sortState}
                />

                {loading ? (
                    <div className="loading-message">Loading tasks...</div>
                ) : error ? (
                    <div className="error-message">Error loading tasks: {error.message}</div>
                ) : groupedProjects.length > 0 ? (
                    <div className="projects-list">
                        {groupedProjects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                expanded={expandedProjectId === project.id}
                                onToggle={() => setExpandedProjectId(prev => prev === project.id ? null : project.id)}
                                services={project.servicesList}
                                searchQuery={searchQuery}
                                onSelect={(item) => {
                                    setSelectedItem(item);
                                    if (item.type === "task") {
                                        const parentService = project.servicesList.find(s => s.tasks.some(t => t.id === item.data.id));
                                        setActiveService(parentService);
                                        setActiveProject(project);
                                    } else if (item.type === "service") {
                                        setActiveService(item.data);
                                        setActiveProject(project);
                                    }
                                    setModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="empty-state-card">
                        <div className="no-projects-message">
                            {(searchQuery || Object.keys(filters).length > 0)
                                ? "No tasks match your current filters. Try adjusting your search criteria."
                                : "You don't have any tasks assigned to you yet."}
                        </div>
                    </Card>
                )}

                {!loading && !error && (
                    <Pagination
                        currentPage={page}
                        totalPages={pageInfo.totalPages || 1}
                        onPageChange={setPage}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                        totalItems={pageInfo.totalElements || 0}
                        pageSizeOptions={[5, 10, 20, 50]}
                    />
                )}
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedItem(null);
                    setActiveProject(null);
                    setActiveService(null);
                }}
                title={selectedItem?.type === "task"
                    ? `Task: ${selectedItem.data.name}`
                    : selectedItem?.type === "service"
                        ? `Service: ${selectedItem.data.serviceName}`
                        : ""}
                size="large"
                className="details-modal"
            >
                {selectedItem && (
                    <div className="details-container">
                        {(activeProject || activeService) && (
                            <div className="details-breadcrumbs">
                                {activeProject && <span className="breadcrumb-item project">Project: {activeProject.name}</span>}
                                {activeProject && activeService && <span className="breadcrumb-separator">›</span>}
                                {activeService && selectedItem.type === "task" && (
                                    <span className="breadcrumb-item service">Service: {activeService.serviceName}</span>
                                )}
                            </div>
                        )}
                        {selectedItem.type === "task" && <TaskDetails data={selectedItem.data} />}
                        {selectedItem.type === "service" && <ServiceDetails data={selectedItem.data} />}
                    </div>
                )}
            </Modal>
        </div>
    );
}