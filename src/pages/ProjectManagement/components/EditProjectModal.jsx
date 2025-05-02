import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import SelectWithCreate from "../../../components/common/SelectWithCreate";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ClientModal from "./ClientModal/ClientModal";
import SelectWithModalCreate from "../../../components/common/SelectWithModalCreate";
import "./EditProjectModal.css";

// Get project reference data
const GET_PROJECT_REFERENCE_DATA = gql`
    query GetProjectReferenceData {
        clients { id name }
        projectTypes { id name }
        projectStatuses { id name }
    }
`;

// Update project mutation
const UPDATE_PROJECT = gql`
    mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) {
            id
            name
        }
    }
`;

// Get project details mutation
const GET_PROJECT_DETAILS = gql`
    query GetProjectDetails($id: ID!) {
        project(id: $id) {
            id
            name
            description
            registrationDate
            status {
                id
                name
            }
            projectType {
                id
                name
            }
            client {
                id
                name
            }
        }
    }
`;

// Create project type mutation
const CREATE_PROJECT_TYPE = gql`
    mutation CreateProjectType($input: CreateProjectTypeInput!) {
        createProjectType(input: $input) {
            id
            name
        }
    }
`;

export default function EditProjectModal({ isOpen, projectId, onClose, onUpdated }) {
    const [project, setProject] = useState({
        name: "",
        description: "",
        clientId: "",
        projectTypeId: "",
        projectStatusId: "",
        registrationDate: ""
    });

    const [showCreateClient, setShowCreateClient] = useState(false);
    const [prefillClientName, setPrefillClientName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch reference data (clients, project types, etc.)
    const { data: refData, loading: refLoading, refetch } = useQuery(GET_PROJECT_REFERENCE_DATA);

    // Fetch project details
    const {
        data: projectData,
        loading: projectLoading
    } = useQuery(GET_PROJECT_DETAILS, {
        variables: { id: projectId },
        skip: !projectId,
        fetchPolicy: "network-only"
    });

    // Mutations
    const [updateProject] = useMutation(UPDATE_PROJECT);

    // Set initial form values when project data is loaded
    useEffect(() => {
        if (projectData?.project) {
            const p = projectData.project;
            setProject({
                name: p.name || "",
                description: p.description || "",
                clientId: p.client?.id || "",
                projectTypeId: p.projectType?.id || "",
                projectStatusId: p.status?.id || "",
                registrationDate: p.registrationDate ? new Date(p.registrationDate).toISOString().slice(0, 10) : ""
            });
        }
    }, [projectData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Update the project with only the fields allowed by the UpdateProjectInput
            await updateProject({
                variables: {
                    id: projectId,
                    input: {
                        name: project.name,
                        description: project.description,
                        clientId: project.clientId ? parseInt(project.clientId) : null,
                        projectTypeId: project.projectTypeId ? parseInt(project.projectTypeId) : null,
                        projectStatusId: project.projectStatusId ? parseInt(project.projectStatusId) : null,
                        registrationDate: project.registrationDate || null
                    }
                }
            });

            setIsLoading(false);
            onClose();
            if (onUpdated) onUpdated();
        } catch (err) {
            console.error("Error updating project:", err);
            setIsLoading(false);
            alert(`Error updating project: ${err.message}`);
        }
    };

    if (!isOpen) return null;

    const loading = refLoading || projectLoading;

    return (
        <Modal isOpen onClose={onClose} title="✏️ Edit Project" size="large">
            <div className="edit-project-form">
                {loading ? (
                    <div className="loading-message">Loading project data...</div>
                ) : (
                    <form onSubmit={handleSave}>
                        <div className="mb-2">
                            <label className="form-label">Name*</label>
                            <input
                                className="form-control"
                                name="name"
                                value={project.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                name="description"
                                rows="2"
                                value={project.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="d-flex align-items-end gap-2 mb-2">
                            <div style={{ flex: 1 }}>
                                <SelectWithModalCreate
                                    label="Client*"
                                    options={refData?.clients || []}
                                    value={project.clientId}
                                    onChange={(id) => setProject((p) => ({ ...p, clientId: id }))}
                                    onCreateStart={(inputValue) => {
                                        setPrefillClientName(inputValue);
                                        setShowCreateClient(true);
                                    }}
                                />
                            </div>
                        </div>

                        <SelectWithCreate
                            label="Project Type*"
                            options={refData?.projectTypes || []}
                            value={project.projectTypeId}
                            onChange={(val) => setProject((p) => ({ ...p, projectTypeId: val }))}
                            createMutation={CREATE_PROJECT_TYPE}
                            refetchOptions={refetch}
                        />

                        <div className="mb-2">
                            <label className="form-label">Status*</label>
                            <select
                                className="form-select"
                                name="projectStatusId"
                                value={project.projectStatusId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Status</option>
                                {refData?.projectStatuses?.map(status => (
                                    <option key={status.id} value={status.id}>{status.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Registration Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="registrationDate"
                                value={project.registrationDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mt-4 d-flex gap-2 justify-content-end">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "💾 Update Project"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Modal for creating new client */}
            <Modal
                isOpen={showCreateClient}
                onClose={() => setShowCreateClient(false)}
                title="➕ New Client"
            >
                <ClientModal
                    client={{ prefillName: prefillClientName }}
                    editMode={false}
                    onSave={(created) => {
                        if (created?.id) {
                            setProject((p) => ({ ...p, clientId: created.id }));
                            refetch();
                        }
                        setShowCreateClient(false);
                    }}
                    onCancel={() => setShowCreateClient(false)}
                />
            </Modal>
        </Modal>
    );
}