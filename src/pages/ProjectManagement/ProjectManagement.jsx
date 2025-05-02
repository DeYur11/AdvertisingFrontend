import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

import { GET_PAGINATED_PROJECTS_WITH_TOTAL } from "./graphql/projectsPagination.gql";
import "./ProjectManagement.css";
import ProjectCard from "./components/ProjectCard/ProjectCard";
import Pagination from "../../components/common/Pagination/Pagination"
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
    const [page, setPage] = useState(1);      // 1-based
    const [size, setSize] = useState(10);
    const [showAddProject, setShowAddProject] = useState(false);
    const [editProjectId, setEditProjectId] = useState(null);
    const [deleteProjectId, setDeleteProjectId] = useState(null);
    const [deleteProjectName, setDeleteProjectName] = useState("");

    const { data, loading, error, refetch } = useQuery(
        GET_PAGINATED_PROJECTS_WITH_TOTAL,
        { variables: { page: page - 1, size }, fetchPolicy: "network-only" }
    );

    // Delete project mutation
    const [deleteProject, { loading: deleteLoading }] = useMutation(DELETE_PROJECT);

    const projects = data?.paginatedProjects?.content ?? [];
    const pageInfo = data?.paginatedProjects?.pageInfo;
    const total    = pageInfo?.totalElements ?? 0;
    const pages    = pageInfo?.totalPages ?? 1;

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

            {loading && <div className="loading-indicator">Loading projects...</div>}
            {error   && <div className="error-message">Error: {error.message}</div>}

            {!loading && !error && (
                <>
                    <div className="projects-list">
                        {projects.length
                            ? projects.map(p => (
                                <ProjectCard
                                    key={p.id}
                                    project={p}
                                    onEdit={() => handleEditProject(p.id)}
                                    onDelete={() => handleDeleteProject(p.id, p.name)}
                                />
                            ))
                            : <div className="no-items-message">No projects found.</div>}
                    </div>

                    {pages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={pages}
                            onPageChange={setPage}
                            pageSize={size}
                            onPageSizeChange={(s) => {setPage(1); setSize(s);}}
                            totalItems={total}
                            pageSizeOptions={[5,10,25,50]}
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