import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import "./ProjectModal.css";

// GraphQL queries and mutations
const GET_PROJECT_REFERENCE_DATA = gql`
    query GetProjectReferenceData {
        projectTypes {
            id
            name
        }
        projectStatuses {
            id
            name
        }
        clients {
            id
            name
            email
            phone
        }
        users {
            id
            name
            surname
            mainRole
        }
    }
`;

const CREATE_PROJECT = gql`
    mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) {
            id
            name
        }
    }
`;

const UPDATE_PROJECT = gql`
    mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) {
            id
            name
        }
    }
`;

const GET_PROJECT_BY_ID = gql`
    query GetProject($id: ID!) {
        project(id: $id) {
            id
            name
            description
            startDate
            endDate
            budget
            status {
                id
            }
            projectType {
                id
            }
            client {
                id
            }
            manager {
                id
            }
        }
    }
`;

export default function ProjectModal({
                                         project,
                                         editMode,
                                         onSave,
                                         onCancel
                                     }) {
    // Default form values
    const defaultForm = {
        name: "",
        description: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        budget: "",
        clientId: "",
        statusId: "",
        typeId: "",
        managerId: ""
    };

    // Form state
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});

    // Fetch reference data
    const { data: refData, loading: refLoading } = useQuery(GET_PROJECT_REFERENCE_DATA);

    // Fetch project data if in edit mode
    const { data: projectData, loading: projectLoading } = useQuery(GET_PROJECT_BY_ID, {
        variables: { id: project?.id },
        skip: !editMode || !project?.id,
        fetchPolicy: "network-only"
    });

    // Mutations
    const [createProject, { loading: createLoading }] = useMutation(CREATE_PROJECT);
    const [updateProject, { loading: updateLoading }] = useMutation(UPDATE_PROJECT);

    // Set form values if in edit mode
    useEffect(() => {
        if (editMode && projectData?.project) {
            const p = projectData.project;
            setForm({
                name: p.name || "",
                description: p.description || "",
                startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : "",
                endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : "",
                budget: p.budget || "",
                clientId: p.client?.id || "",
                statusId: p.status?.id || "",
                typeId: p.projectType?.id || "",
                managerId: p.manager?.id || ""
            });
        }
    }, [editMode, projectData]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Project name is required";
        }

        if (!form.clientId) {
            newErrors.clientId = "Client is required";
        }

        if (!form.statusId) {
            newErrors.statusId = "Status is required";
        }

        if (!form.typeId) {
            newErrors.typeId = "Project type is required";
        }

        if (!form.managerId) {
            newErrors.managerId = "Manager is required";
        }

        if (form.budget && isNaN(parseFloat(form.budget))) {
            newErrors.budget = "Budget must be a number";
        }

        if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
            newErrors.endDate = "End date cannot be earlier than start date";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (editMode) {
                await updateProject({
                    variables: {
                        id: project.id,
                        input: {
                            name: form.name,
                            description: form.description,
                            startDate: form.startDate || null,
                            endDate: form.endDate || null,
                            budget: form.budget ? parseFloat(form.budget) : null,
                            clientId: parseInt(form.clientId),
                            statusId: parseInt(form.statusId),
                            typeId: parseInt(form.typeId),
                            managerId: parseInt(form.managerId)
                        }
                    }
                });
            } else {
                await createProject({
                    variables: {
                        input: {
                            name: form.name,
                            description: form.description,
                            startDate: form.startDate || null,
                            endDate: form.endDate || null,
                            budget: form.budget ? parseFloat(form.budget) : null,
                            clientId: parseInt(form.clientId),
                            statusId: parseInt(form.statusId),
                            typeId: parseInt(form.typeId),
                            managerId: parseInt(form.managerId)
                        }
                    }
                });
            }

            onSave();
        } catch (error) {
            console.error("Error saving project:", error);
            setErrors({ submit: error.message });
        }
    };

    // Loading state
    const isLoading = refLoading || projectLoading || createLoading || updateLoading;

    // Filter users to only show Project Managers
    const getProjectManagers = () => {
        if (!refData?.users) return [];

        return refData.users.filter(user =>
            user.mainRole === "ProjectManager"
        );
    };

    return (
        <div className="project-modal">
            {isLoading ? (
                <div className="loading-message">Loading...</div>
            ) : (
                <form onSubmit={handleSubmit} className="project-form">
                    <div className="form-grid">
                        {/* Project Name */}
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Project Name*</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className={`form-input ${errors.name ? 'has-error' : ''}`}
                                placeholder="Enter project name"
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        {/* Client */}
                        <div className="form-group">
                            <label htmlFor="clientId" className="form-label">Client*</label>
                            <select
                                id="clientId"
                                name="clientId"
                                value={form.clientId}
                                onChange={handleChange}
                                className={`form-select ${errors.clientId ? 'has-error' : ''}`}
                            >
                                <option value="">Select Client</option>
                                {refData?.clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                            {errors.clientId && <div className="error-message">{errors.clientId}</div>}
                        </div>

                        {/* Project Type */}
                        <div className="form-group">
                            <label htmlFor="typeId" className="form-label">Project Type*</label>
                            <select
                                id="typeId"
                                name="typeId"
                                value={form.typeId}
                                onChange={handleChange}
                                className={`form-select ${errors.typeId ? 'has-error' : ''}`}
                            >
                                <option value="">Select Type</option>
                                {refData?.projectTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            {errors.typeId && <div className="error-message">{errors.typeId}</div>}
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label htmlFor="statusId" className="form-label">Status*</label>
                            <select
                                id="statusId"
                                name="statusId"
                                value={form.statusId}
                                onChange={handleChange}
                                className={`form-select ${errors.statusId ? 'has-error' : ''}`}
                            >
                                <option value="">Select Status</option>
                                {refData?.projectStatuses.map(status => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>
                            {errors.statusId && <div className="error-message">{errors.statusId}</div>}
                        </div>

                        {/* Manager */}
                        <div className="form-group">
                            <label htmlFor="managerId" className="form-label">Project Manager*</label>
                            <select
                                id="managerId"
                                name="managerId"
                                value={form.managerId}
                                onChange={handleChange}
                                className={`form-select ${errors.managerId ? 'has-error' : ''}`}
                            >
                                <option value="">Select Manager</option>
                                {getProjectManagers().map(manager => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.name} {manager.surname}
                                    </option>
                                ))}
                            </select>
                            {errors.managerId && <div className="error-message">{errors.managerId}</div>}
                        </div>

                        {/* Start Date */}
                        <div className="form-group">
                            <label htmlFor="startDate" className="form-label">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        {/* End Date */}
                        <div className="form-group">
                            <label htmlFor="endDate" className="form-label">End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                className={`form-input ${errors.endDate ? 'has-error' : ''}`}
                            />
                            {errors.endDate && <div className="error-message">{errors.endDate}</div>}
                        </div>

                        {/* Budget */}
                        <div className="form-group">
                            <label htmlFor="budget" className="form-label">Budget</label>
                            <div className="input-with-prefix">
                                <span className="input-prefix">$</span>
                                <input
                                    type="text"
                                    id="budget"
                                    name="budget"
                                    value={form.budget}
                                    onChange={handleChange}
                                    className={`form-input ${errors.budget ? 'has-error' : ''}`}
                                    placeholder="Enter budget amount"
                                />
                            </div>
                            {errors.budget && <div className="error-message">{errors.budget}</div>}
                        </div>

                        {/* Description */}
                        <div className="form-group full-width">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Enter project description"
                                rows="4"
                            />
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="submit-error-message">
                            Error: {errors.submit}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? (editMode ? "Updating..." : "Creating...")
                                : (editMode ? "Update Project" : "Create Project")
                            }
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}