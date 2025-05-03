import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import SelectWithCreate from "../../../components/common/SelectWithCreate";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ClientModal from "./ClientModal/ClientModal";
import SelectWithModalCreate from "../../../components/common/SelectWithModalCreate";
import "./EditProjectModal.css";

// Запит для довідкових даних
const GET_PROJECT_REFERENCE_DATA = gql`
    query GetProjectReferenceData {
        clients { id name }
        projectTypes { id name }
        projectStatuses { id name }
        workersByPosition(position: "Project Manager") {
            id
            name
            surname
        }
    }
`;


// Мутація оновлення
const UPDATE_PROJECT = gql`
    mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) {
            id
            name
        }
    }
`;

// Мутація створення типу проекту
const CREATE_PROJECT_TYPE = gql`
    mutation CreateProjectType($input: CreateProjectTypeInput!) {
        createProjectType(input: $input) {
            id
            name
        }
    }
`;

const GET_PROJECT_DETAILS = gql`
    query GET_PROJECT_DETAILS($id: ID!) {
        project(id: $id) {
            id
            name
            description
            cost
            estimateCost
            paymentDeadline
            registrationDate

            client {
                id
            }

            projectType {
                id
                name
            }

            status {
                id
                name
            }

            manager {
                id
            }
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
        cost: "",
        estimateCost: "",
        paymentDeadline: "",
        managerId: ""
    });

    const [showCreateClient, setShowCreateClient] = useState(false);
    const [prefillClientName, setPrefillClientName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { data: refData, loading: refLoading, refetch } = useQuery(GET_PROJECT_REFERENCE_DATA);

    const { data: projectData, loading: projectLoading } = useQuery(GET_PROJECT_DETAILS, {
        variables: { id: projectId },
        skip: !projectId,
        fetchPolicy: "network-only"
    });

    const [updateProject] = useMutation(UPDATE_PROJECT);

    useEffect(() => {
        if (projectData?.project) {
            const p = projectData.project;
            setProject({
                name: p.name || "",
                description: p.description || "",
                clientId: p.client?.id || "",
                projectTypeId: p.projectType?.id || "",
                projectStatusId: p.status?.id || "",
                cost: p.cost !== null && p.cost !== undefined ? p.cost.toString() : "",
                estimateCost: p.estimateCost !== null && p.estimateCost !== undefined ? p.estimateCost.toString() : "",
                paymentDeadline: p.paymentDeadline || "",
                managerId: p.manager?.id || ""
            });
        }
    }, [projectData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log(project)
        try {
            await updateProject({
                variables: {
                    id: projectId,
                    input: {
                        name: project.name,
                        description: project.description || null,
                        clientId: parseInt(project.clientId),
                        projectTypeId: parseInt(project.projectTypeId),
                        projectStatusId: parseInt(project.projectStatusId),
                        cost: project.cost !== "" ? parseFloat(project.cost) : null,
                        estimateCost: project.estimateCost !== "" ? parseFloat(project.estimateCost) : null,
                        paymentDeadline: project.paymentDeadline || null,
                        managerId: project.managerId ? parseInt(project.managerId) : null
                    }
                }
            });

            setIsLoading(false);
            onClose();
            if (onUpdated) onUpdated();
        } catch (err) {
            console.error("Error updating project:", err);
            alert(`Error updating project: ${err.message}`);
            setIsLoading(false);
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
                                {refData?.projectStatuses?.map((status) => (
                                    <option key={status.id} value={status.id}>{status.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Manager</label>
                            <select
                                className="form-select"
                                name="managerId"
                                value={project.managerId}
                                onChange={handleChange}
                            >
                                <option value="">— none —</option>
                                {refData?.workersByPosition?.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name} {w.surname}</option>
                                ))}
                            </select>
                        </div>

                        <div className="row g-2 mb-2">
                            <div className="col">
                                <label className="form-label">Payment Deadline</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="paymentDeadline"
                                    value={project.paymentDeadline}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col">
                                <label className="form-label">Estimate Cost, $</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="estimateCost"
                                    value={project.estimateCost}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                            <div className="col">
                                <label className="form-label">Cost, $</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="cost"
                                    value={project.cost}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
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

            {/* Модалка створення клієнта */}
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
