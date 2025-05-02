import { useState } from "react";
import { useQuery } from "@apollo/client";

import { GET_PAGINATED_PROJECTS_WITH_TOTAL } from "./graphql/projectsPagination.gql";
import "./ProjectManagement.css";
import ProjectCard from "./components/ProjectCard/ProjectCard";
import Pagination from "../../components/common/Pagination/Pagination"
import Button from "../../components/common/Button/Button";
import AddProjectModal from "./components/AddProjectModal";

export default function ProjectManagement() {
    const [page, setPage] = useState(1);      // 1-based
    const [size, setSize] = useState(10);
    const [showAddProject, setShowAddProject] = useState(false);
    const { data, loading, error, refetch } = useQuery(
        GET_PAGINATED_PROJECTS_WITH_TOTAL,
        { variables: { page: page - 1, size }, fetchPolicy: "network-only" }
    );

    const projects = data?.paginatedProjects?.content ?? [];
    const pageInfo = data?.paginatedProjects?.pageInfo;
    const total    = pageInfo?.totalElements ?? 0;
    const pages    = pageInfo?.totalPages ?? 1;

    return (
        <div className="project-management-container">
            <header className="page-header">
                <h1>Project Management</h1>
                <p className="subtitle">View and manage your projects</p>
                <Button variant="primary" size="small" icon="➕"
                        onClick={()=>setShowAddProject(true)}>Add Project</Button>
            </header>

            {loading && <div className="loading-indicator">Loading projects...</div>}
            {error   && <div className="error-message">Error: {error.message}</div>}

            {!loading && !error && (
                <>
                    <div className="projects-list">
                        {projects.length
                            ? projects.map(p => <ProjectCard key={p.id} project={p} />)
                            : <div className="no-items-message">No projects found.</div>}
                    </div>

                    {pages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={pages}
                            onPageChange={setPage}
                            pageSize={size}
                            onPageSizeChange={(s)=>{setPage(1); setSize(s);}}
                            totalItems={total}
                            pageSizeOptions={[5,10,25,50]}
                        />
                    )}
                </>
            )}

            {showAddProject && (
                <AddProjectModal
                    isOpen={showAddProject}
                    onClose={()=>setShowAddProject(false)}
                    onCreated={()=>{ setShowAddProject(false); refetch(); }}
                />
            )}
        </div>
    );
}
