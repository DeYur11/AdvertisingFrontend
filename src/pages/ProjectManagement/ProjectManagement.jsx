import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

import { GET_PAGINATED_PROJECTS_WITH_TOTAL } from "./graphql/projectsPagination.gql";
import "./ProjectManagement.css";
import ProjectCard from "./components/ProjectCard/ProjectCard";
import ProjectFilterPanel from "./components/ProjectFilterPanel/ProjectFilterPanel";
import Pagination from "../../components/common/Pagination/Pagination";
import Button from "../../components/common/Button/Button";
import AddProjectModal from "./components/AddProjectModal";
import EditProjectModal from "./components/EditProjectModal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog/ConfirmationDialog";

// Delete project mutation
const DELETE_PROJECT = gql`
    mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
    }
`;

export default function ProjectManagement() {
    // Pagination state
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    // Sorting state
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("ASC");

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);

    // Modal states
    const [showAddProject, setShowAddProject] = useState(false);
    const [editProjectId, setEditProjectId] = useState(null);
    const [deleteProjectId, setDeleteProjectId] = useState(null);
    const [deleteProjectName, setDeleteProjectName] = useState("");

    // Convert UI filters to GraphQL filter input
    const buildFilterInput = () => {
        const filterInput = {};

        // Add search query to name and description filters
        if (searchQuery) {
            filterInput.nameContains = searchQuery;
            filterInput.descriptionContains = searchQuery;
        }

        // Add status filters
        if (filters.status && filters.status.length > 0) {
            filterInput.statusIds = filters.status;
        }

        // Add project type filters
        if (filters.projectType && filters.projectType.length > 0) {
            filterInput.projectTypeIds = filters.projectType;
        }

        // Add client filters
        if (filters.clientId && filters.clientId.length > 0) {
            filterInput.clientIds = filters.clientId;
        }

        // Add manager filters
        if (filters.managerId && filters.managerId.length > 0) {
            filterInput.managerIds = filters.managerId;
        }

        // Add date range filters
        if (filters.date) {
            if (filters.date.from) {
                filterInput.startDateFrom = filters.date.from;
            }
            if (filters.date.to) {
                filterInput.startDateTo = filters.date.to;
            }
        }

        // Add cost range filters
        if (filters.cost) {
            if (filters.cost.min !== undefined) {
                filterInput.costMin = filters.cost.min;
            }
            if (filters.cost.max !== undefined) {
                filterInput.costMax = filters.cost.max;
            }
        }

        return filterInput;
    };

    const { data, loading, error, refetch } = useQuery(
        GET_PAGINATED_PROJECTS_WITH_TOTAL,
        {
            variables: {
                input: {
                    page: page - 1, // Convert to 0-based for backend
                    size,
                    sortField,
                    sortDirection,
                    filter: buildFilterInput()
                }
            },
            fetchPolicy: "network-only"
        }
    );

    // Delete project mutation
    const [deleteProject, { loading: deleteLoading }] = useMutation(DELETE_PROJECT);

    const projects = data?.paginatedProjects?.content ?? [];
    const pageInfo = data?.paginatedProjects?.pageInfo;
    const total    = pageInfo?.totalElements ?? 0;
    const pages    = pageInfo?.totalPages ?? 1;

    // Handle sort change
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortDirection(direction);
    };

    const handleEditProject = (projectId) => {
        setEditProjectId(projectId);
    };

    const handleCloseEditModal = () => {
        setEditProjectId(null);
    };

    const handleProjectUpdated = () => {
        refetch();
        setEditProjectId(null);
    };

    const handleDeleteProject = (projectId, projectName) => {
        setDeleteProjectId(projectId);
        setDeleteProjectName(projectName);
    };

    const confirmDeleteProject = async () => {
        try {
            await deleteProject({
                variables: { id: deleteProjectId }
            });

            // Refresh the projects list
            refetch();

            // Reset delete state
            setDeleteProjectId(null);
            setDeleteProjectName("");
        } catch (err) {
            console.error("Error deleting project:", err);
            alert(`Error deleting project: ${err.message}`);
        }
    };

    return (
        <div className="project-management-container">
            <header className="page-header">
                <h1>Project Management</h1>
                <p className="subtitle">View and manage your projects</p>
                <Button
                    variant="primary"
                    size="small"
                    icon="➕"
                    onClick={() => setShowAddProject(true)}
                >
                    Add Project
                </Button>
            </header>

            {/* Filter panel */}
            <ProjectFilterPanel
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
                expanded={filterPanelExpanded}
                setExpanded={setFilterPanelExpanded}
                onSortChange={handleSortChange}
                currentSortField={sortField}
                currentSortDirection={sortDirection}
            />

            {loading && <div className="loading-indicator">Loading projects...</div>}
            {error   && <div className="error-message">Error: {error.message}</div>}

            {!loading && !error && (
                <>
                    <div className="projects-list">
                        {projects.length > 0 ? (
                            projects.map(p => (
                                <ProjectCard
                                    key={p.id}
                                    project={p}
                                    onEdit={() => handleEditProject(p.id)}
                                    onDelete={() => handleDeleteProject(p.id, p.name)}
                                />
                            ))
                        ) : (
                            <div className="no-items-message">
                                {Object.keys(filters).length > 0 || searchQuery
                                    ? "No projects match your search criteria. Try adjusting your filters."
                                    : "No projects found. Click 'Add Project' to create your first project."}
                            </div>
                        )}
                    </div>

                    {pages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={pages}
                            onPageChange={setPage}
                            pageSize={size}
                            onPageSizeChange={(s) => {
                                setPage(1);
                                setSize(s);
                            }}
                            totalItems={total}
                            pageSizeOptions={[5, 10, 25, 50]}
                        />
                    )}
                </>
            )}

            {/* Add Project Modal */}
            {showAddProject && (
                <AddProjectModal
                    isOpen={showAddProject}
                    onClose={() => setShowAddProject(false)}
                    onCreated={() => { setShowAddProject(false); refetch(); }}
                />
            )}

            {/* Edit Project Modal */}
            {editProjectId && (
                <EditProjectModal
                    isOpen={true}
                    projectId={editProjectId}
                    onClose={handleCloseEditModal}
                    onUpdated={handleProjectUpdated}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={!!deleteProjectId}
                onClose={() => setDeleteProjectId(null)}
                onConfirm={confirmDeleteProject}
                title="Delete Project"
                message={`Are you sure you want to delete the project "${deleteProjectName}"? This will also delete all associated services and tasks. This action cannot be undone.`}
                confirmText="Delete Project"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}