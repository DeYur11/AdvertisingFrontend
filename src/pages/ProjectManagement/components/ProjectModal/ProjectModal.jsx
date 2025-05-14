import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProjectModal.css";

// GraphQL запити та мутації
const GET_PROJECT_REFERENCE_DATA = gql`
    query GetProjectReferenceData {
        projectTypes { id name }
        projectStatuses { id name }
        clients { id name email phone }
        users { id name surname mainRole }
    }
`;

const CREATE_PROJECT = gql`
    mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) { id name }
    }
`;

const UPDATE_PROJECT = gql`
    mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) { id name }
    }
`;

const GET_PROJECT_BY_ID = gql`
    query GetProject($id: ID!) {
        project(id: $id) {
            id name description startDate endDate budget
            status { id }
            projectType { id }
            client { id }
            manager { id }
        }
    }
`;

export default function ProjectModal({ project, editMode, onSave, onCancel }) {
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

    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});

    const {data: refData, loading: refLoading} = useQuery(GET_PROJECT_REFERENCE_DATA);
    const {data: projectData, loading: projectLoading} = useQuery(GET_PROJECT_BY_ID, {
        variables: {id: project?.id},
        skip: !editMode || !project?.id,
        fetchPolicy: "network-only"
    });

    const [createProject, {loading: createLoading}] = useMutation(CREATE_PROJECT);
    const [updateProject, {loading: updateLoading}] = useMutation(UPDATE_PROJECT);

    useEffect(() => {
        if (editMode && projectData?.project) {
            const p = projectData.project;
            setForm({
                name: p.name || "",
                description: p.description || "",
                startDate: p.startDate ? p.startDate.split('T')[0] : "",
                endDate: p.endDate ? p.endDate.split('T')[0] : "",
                budget: p.budget ?? "",
                clientId: p.client?.id ?? "",
                statusId: p.status?.id ?? "",
                typeId: p.projectType?.id ?? "",
                managerId: p.manager?.id ?? ""
            });
            setErrors({});
        }
    }, [editMode, projectData]);

    const handleChange = ({target: {name, value}}) => {
        setForm(prev => ({...prev, [name]: value}));
        if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Потрібна назва проєкту";
        if (!form.clientId) newErrors.clientId = "Потрібен клієнт";
        if (!form.typeId) newErrors.typeId = "Потрібен тип проєкту";
        if (!form.statusId) newErrors.statusId = "Потрібен статус";
        if (!form.managerId) newErrors.managerId = "Потрібен менеджер";
        if (form.budget && isNaN(+form.budget)) newErrors.budget = "Бюджет має бути числом";
        if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
            newErrors.endDate = "Дата завершення не може бути раніше дати початку";
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length) {
            Object.values(newErrors).forEach(msg => toast.error(msg));
            return false;
        }
        return true;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const input = {
                name: form.name,
                description: form.description || null,
                startDate: form.startDate || null,
                endDate: form.endDate || null,
                budget: form.budget ? +form.budget : null,
                clientId: +form.clientId,
                statusId: +form.statusId,
                typeId: +form.typeId,
                managerId: +form.managerId
            };
            if (editMode) {
                await updateProject({variables: {id: project.id, input}});
                toast.success("Проєкт оновлено");
            } else {
                await createProject({variables: {input}});
                toast.success("Проєкт створено");
            }
            onSave();
        } catch ({message}) {
            toast.error(`Помилка збереження: ${message}`);
            setErrors({submit: message});
        }
    };

    const isLoading = refLoading || projectLoading || createLoading || updateLoading;
    const projectManagers = refData?.users?.filter(u => u.mainRole === "ProjectManager") || [];

    return (
        <div className="project-modal">
            {isLoading ? (
                <div className="loading-message">Завантаження…</div>
            ) : (
                <form onSubmit={handleSubmit} className="project-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Назва проєкту*</label>
                            <input
                                id="name" name="name" type="text"
                                value={form.name}
                                onChange={handleChange}
                                className={`form-input ${errors.name ? 'has-error' : ''}`}
                                placeholder="Введіть назву">
                            </input>
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="clientId" className="form-label">Клієнт*</label>
                            <select
                                id="clientId" name="clientId"
                                value={form.clientId}
                                onChange={handleChange}
                                className={`form-select ${errors.clientId ? 'has-error' : ''}`}
                            >
                                <option value="">Оберіть клієнта</option>
                                {refData?.clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.clientId && <div className="error-message">{errors.clientId}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="typeId" className="form-label">Тип проєкту*</label>
                            <select
                                id="typeId" name="typeId"
                                value={form.typeId}
                                onChange={handleChange}
                                className={`form-select ${errors.typeId ? 'has-error' : ''}`}
                            >
                                <option value="">Оберіть тип</option>
                                {refData?.projectTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {errors.typeId && <div className="error-message">{errors.typeId}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="statusId" className="form-label">Статус*</label>
                            <select
                                id="statusId" name="statusId"
                                value={form.statusId}
                                onChange={handleChange}
                                className={`form-select ${errors.statusId ? 'has-error' : ''}`}
                            >
                                <option value="">Оберіть статус</option>
                                {refData?.projectStatuses.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.statusId && <div className="error-message">{errors.statusId}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="managerId" className="form-label">Менеджер проєкту*</label>
                            <select
                                id="managerId" name="managerId"
                                value={form.managerId}
                                onChange={handleChange}
                                className={`form-select ${errors.managerId ? 'has-error' : ''}`}
                            >
                                <option value="">Оберіть менеджера</option>
                                {projectManagers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} {m.surname}</option>
                                ))}
                            </select>
                            {errors.managerId && <div className="error-message">{errors.managerId}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="startDate" className="form-label">Дата початку</label>
                            <input
                                id="startDate" name="startDate" type="date"
                                value={form.startDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate" className="form-label">Дата завершення</label>
                            <input
                                id="endDate" name="endDate" type="date"
                                value={form.endDate}
                                onChange={handleChange}
                                className={`form-input ${errors.endDate ? 'has-error' : ''}`}
                            />
                            {errors.endDate && <div className="error-message">{errors.endDate}</div>}
                        </div>
                        <div className="form-group"><label htmlFor="budget" className="form-label">Бюджет</label>
                            <div className="input-with-prefix"><span className="input-prefix">$</span><input id="budget"
                                                                                                             name="budget"
                                                                                                             type="text"
                                                                                                             value={form.budget}
                                                                                                             onChange={handleChange}
                                                                                                             className={`form-input ${errors.budget ? 'has-error' : ''}`}
                                                                                                             placeholder="Введіть суму"/>
                            </div>
                            {errors.budget && <div className="error-message">{errors.budget}</div>}</div>
                        <div className="form-group full-width">
                            <label htmlFor="description" className="form-label">Опис</label>
                            <textarea
                                id="description" name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Опишіть проєкт"
                                rows="4"
                            />
                        </div>
                    </div>
                    {errors.submit && <div className="submit-error-message">{errors.submit}</div>}
                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={onCancel}
                                disabled={isLoading}>Скасувати
                        </button>
                        <button type="submit" className="submit-button"
                                disabled={isLoading}>{isLoading ? (editMode ? "Оновлення…" : "Створення…") : (editMode ? "Оновити" : "Створити")}</button>
                    </div>
                </form>
            )}
        </div>
    );
}