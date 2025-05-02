import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, gql } from "@apollo/client";
import "./ProjectManagement.css";

// UI Components
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Modal from "../../components/common/Modal/Modal";

// Project-specific components
import ProjectFilterPanel from "./components/ProjectFilterPanel/ProjectFilterPanel";
import CompactProjectCard from "./components/CompactProjectCard/CompactProjectCard";
import ClientModal from "./components/ClientModal/ClientModal";
import ProjectModal from "./components/ProjectModal/ProjectModal";
import ServiceModal from "./components/ServiceModal/ServiceModal";
import ConfirmationModal from "./components/ConfirmationModal/ConfirmationModal";

// GraphQL queries and mutations
const GET_PROJECTS = gql`
    query GetProjects {
        projects {
            id
            name
            description
            startDate
            endDate
            budget
            status {
                id
                name
            }
            client {
                id
                name
                email
                phone
            }
            projectType {
                id
                name
            }
            manager {
                id
                name
                surname
            }
            services {
                id
                serviceName
                description
                estimateCost
                duration
                serviceType {
                    id
                    name
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
                    tasks {
                        id
                        name
                        description
                        priority
                        deadline
                        taskStatus {
                            id
                            name
                        }
                    }
                }
            }
        }
    }
`;

const DELETE_PROJECT = gql`
    mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
    }
`;

const DELETE_SERVICE = gql`
    mutation DeleteService($id: ID!) {
        deleteService(id: $id)
    }
`;

const DELETE_CLIENT = gql`
    mutation DeleteClient($id: ID!) {
        deleteClient(id: $id)
    }
`;

export default function ProjectManagement() {
    const user = useSelector(state => state.user);
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);

    // Modals state
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // Fetch projects data
    const { loading, error, data, refetch } = useQuery(GET_PROJECTS);

    // Mutations
    const [deleteProject] = useMutation(DELETE_PROJECT);
    const [deleteService] = useMutation(DELETE_SERVICE);
    const [deleteClient] = useMutation(DELETE_CLIENT);

    // Check if user is a Project Manager
    const isProjectManager = user.mainRole === "ProjectManager";

    if (!isProjectManager) {
        return (
            <div className="project-management-container">
                <Card className="access-denied">
                    <div className="access-denied-icon">⚠️</div>
                    <h2>Access Denied</h2>
                    <p>This page is only accessible to Project Managers.</p>
                </Card>
            </div>
        );
    }

    const toggleProject = (id) => {
        setExpandedProjectId(prev => (prev === id ? null : id));
    };

    const handleAddProject = () => {
        setEditMode(false);
        setSelectedProject(null);
        setShowProjectModal(true);
    };

    const handleEditProject = (project) => {
        setEditMode(true);
        setSelectedProject(project);
        setShowProjectModal(true);
    };

    const handleDeleteProject = (project) => {
        setSelectedProject(project);
        setDeleteConfirmation({
            type: "project",
            id: project.id,
            name: project.name
        });
    };

    const handleAddService = (projectId) => {
        setEditMode(false);
        setSelectedProject({ id: projectId });
        setSelectedService(null);
        setShowServiceModal(true);
    };

    const handleEditService = (service, projectId) => {
        setEditMode(true);
        setSelectedProject({ id: projectId });
        setSelectedService(service);
        setShowServiceModal(true);
    };

    const handleDeleteService = (service) => {
        setSelectedService(service);
        setDeleteConfirmation({
            type: "service",
            id: service.id,
            name: service.serviceName
        });
    };

    const handleAddClient = () => {
        setEditMode(false);
        setSelectedClient(null);
        setShowClientModal(true);
    };

    const handleEditClient = (client) => {
        setEditMode(true);
        setSelectedClient(client);
        setShowClientModal(true);
    };

    const handleDeleteClient = (client) => {
        setSelectedClient(client);
        setDeleteConfirmation({
            type: "client",
            id: client.id,
            name: client.name
        });
    };

    const confirmDelete = async () => {
        try {
            if (deleteConfirmation.type === "project") {
                await deleteProject({ variables: { id: deleteConfirmation.id }});
            } else if (deleteConfirmation.type === "service") {
                await deleteService({ variables: { id: deleteConfirmation.id }});
            } else if (deleteConfirmation.type === "client") {
                await deleteClient({ variables: { id: deleteConfirmation.id }});
            }

            refetch();
            setDeleteConfirmation(null);
        } catch (error) {
            console.error(`Error deleting ${deleteConfirmation.type}:`, error);
        }
    };

    // Filter projects based on search query and filters
    const getFilteredProjects = () => {
        if (!data?.projects) return [];

        return data.projects.filter(project => {
            // Search query filter
            const matchesSearch =
                searchQuery === "" ||
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.services.some(service =>
                    service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()));

            if (!matchesSearch) return false;

            // Apply additional filters
            if (filters.status && filters.status.length > 0) {
                if (!project.status || !filters.status.includes(project.status.name.toLowerCase())) {
                    return false;
                }
            }

            if (filters.projectType && filters.projectType.length > 0) {
                if (!project.projectType || !filters.projectType.includes(project.projectType.name)) {
                    return false;
                }
            }

            if (filters.clientId && filters.clientId.length > 0) {
                if (!project.client || !filters.clientId.includes(project.client.id)) {
                    return false;
                }
            }

            if (filters.date) {
                const projectStartDate = project.startDate ? new Date(project.startDate) : null;
                const projectEndDate = project.endDate ? new Date(project.endDate) : null;

                if (filters.date.from) {
                    const fromDate = new Date(filters.date.from);
                    if (!projectStartDate || projectStartDate < fromDate) {
                        return false;
                    }
                }

                if (filters.date.to) {
                    const toDate = new Date(filters.date.to);
                    if (!projectEndDate || projectEndDate > toDate) {
                        return false;
                    }
                }
            }

            return true;
        });
    };

    return (
        <div className="project-management-container">
            <div className="project-management-header">
                <div className="header-left">
                    <h1>Project Management</h1>
                    <p className="subtitle">Manage your projects, services, and clients</p>
                </div>
                <div className="header-actions">
                    <Button
                        variant="outline"
                        size="medium"
                        icon="👤"
                        onClick={handleAddClient}
                    >
                        New Client
                    </Button>
                    <Button
                        variant="primary"
                        size="medium"
                        icon="📂"
                        onClick={handleAddProject}
                    >
                        New Project
                    </Button>
                </div>
            </div>

            <ProjectFilterPanel
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
                expanded={filterPanelExpanded}
                setExpanded={setFilterPanelExpanded}
            />

            {loading ? (
                <div className="loading-message">Loading projects...</div>
            ) : error ? (
                <div className="error-message">Error loading projects: {error.message}</div>
            ) : (
                <div className="projects-list">
                    {getFilteredProjects().length > 0 ? (
                        getFilteredProjects().map(project => (
                            <CompactProjectCard
                                key={project.id}
                                project={project}
                                expanded={expandedProjectId === project.id}
                                onToggle={() => toggleProject(project.id)}
                                searchQuery={searchQuery}
                                onAddService={() => handleAddService(project.id)}
                                onEditProject={() => handleEditProject(project)}
                                onDeleteProject={() => handleDeleteProject(project)}
                                onEditService={(service) => handleEditService(service, project.id)}
                                onDeleteService={handleDeleteService}
                                onEditClient={() => handleEditClient(project.client)}
                            />
                        ))
                    ) : (
                        <Card className="empty-state-card">
                            <div className="no-projects-message">
                                {searchQuery || Object.keys(filters).length > 0
                                    ? "No projects match your current filters. Try adjusting your search or filters."
                                    : "No projects found. Click 'New Project' to create your first project."}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Project Modal - Add/Edit */}
            <Modal
                isOpen={showProjectModal}
                onClose={() => setShowProjectModal(false)}
                title={editMode ? "Edit Project" : "Add New Project"}
                size="large"
            >
                <ProjectModal
                    project={selectedProject}
                    editMode={editMode}
                    onSave={() => {
                        setShowProjectModal(false);
                        refetch();
                    }}
                    onCancel={() => setShowProjectModal(false)}
                />
            </Modal>

            {/* Service Modal - Add/Edit */}
            <Modal
                isOpen={showServiceModal}
                onClose={() => setShowServiceModal(false)}
                title={editMode ? "Edit Service" : "Add New Service"}
                size="large"
            >
                <ServiceModal
                    service={selectedService}
                    projectId={selectedProject?.id}
                    editMode={editMode}
                    onSave={() => {
                        setShowServiceModal(false);
                        refetch();
                    }}
                    onCancel={() => setShowServiceModal(false)}
                />
            </Modal>

            {/* Client Modal - Add/Edit */}
            <Modal
                isOpen={showClientModal}
                onClose={() => setShowClientModal(false)}
                title={editMode ? "Edit Client" : "Add New Client"}
                size="medium"
            >
                <ClientModal
                    client={selectedClient}
                    editMode={editMode}
                    onSave={() => {
                        setShowClientModal(false);
                        refetch();
                    }}
                    onCancel={() => setShowClientModal(false)}
                />
            </Modal>

            {/* Confirmation Modal - Delete */}
            <ConfirmationModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={confirmDelete}
                type={deleteConfirmation?.type}
                name={deleteConfirmation?.name}
            />
        </div>
    );
}