import { useState, useEffect } from "react";
import { useQuery, useMutation, gql, useApolloClient } from "@apollo/client";
import SelectWithCreate from "../../../components/common/SelectWithCreate";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ClientModal from "./ClientModal/ClientModal";
import SelectWithModalCreate from "../../../components/common/SelectWithModalCreate";
import DatePicker from "../../../components/common/DatePicker/DatePicker";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditProjectModal.css";

/* ─── GraphQL-запити ───────────────────────────────────────────────────────────── */
const GET_PROJECT_REFERENCE_DATA = gql`
    query GetProjectReferenceData {
        clients { id name }
        projectTypes { id name }
        projectStatuses { id name }
        services { id serviceName estimateCost }
        workersByPosition(position: "Project Manager") {
            id name surname
        }
    }
`;

const GET_PROJECT_DETAILS = gql`
    query GetProjectDetails($id: ID!) {
        project(id: $id) {
            id
            name
            description
            cost
            estimateCost
            registrationDate
            startDate
            endDate
            paymentDeadline
            client { id }
            projectType { id }
            status { id name }
            manager { id }
            projectServices {
                id
                amount
                service {
                    id
                    serviceName
                    estimateCost
                }
            }
        }
    }
`;

const UPDATE_PROJECT = gql`
    mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) { id }
    }
`;

const CREATE_PROJECT_TYPE = gql`
    mutation($input: CreateProjectTypeInput!) {
        createProjectType(input: $input) { id name }
    }
`;

const CREATE_PS = gql`
    mutation($input: CreateProjectServiceInput!) {
        createProjectService(input: $input) { id }
    }
`;

const UPDATE_PS = gql`
    mutation($id: ID!, $input: UpdateProjectServiceInput!) {
        updateProjectService(id: $id, input: $input) { id }
    }
`;

const DELETE_PS = gql`
    mutation($id: ID!) {
        deleteProjectService(id: $id)
    }
`;

/* ─── Компонент ───────────────────────────────────────────────────────────────── */
export default function EditProjectModal({ isOpen, projectId, onClose, onUpdated }) {
    const [errors, setErrors] = useState({});
    const [invalidServiceIndexes, setInvalidServiceIndexes] = useState([]);
    const [project, setProject] = useState({
        name: "",
        description: "",
        clientId: "",
        projectTypeId: "",
        projectStatusId: "",
        managerId: "",
        estimateCost: "",
        cost: "",
        registrationDate: "",
        startDate: "",
        endDate: "",
        paymentDeadline: "",
        services: []
    });
    const [initialStatusId, setInitialStatusId] = useState("");
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [prefillClientName, setPrefillClientName] = useState("");
    const [isSaving, setSaving] = useState(false);
    const [isProjectExpired, setIsProjectExpired] = useState(false);
    const client = useApolloClient();

    const { data: ref, loading: refLoading, refetch } = useQuery(
        GET_PROJECT_REFERENCE_DATA,
        { onError: err => toast.error(`Помилка довідників: ${err.message}`) }
    );
    const { data: det, loading: detLoading } = useQuery(
        GET_PROJECT_DETAILS,
        {
            variables: { id: projectId },
            skip: !projectId,
            fetchPolicy: "network-only",
            onError: err => toast.error(`Помилка деталей: ${err.message}`)
        }
    );

    const [updateProject] = useMutation(UPDATE_PROJECT);
    const [createPS] = useMutation(CREATE_PS);
    const [updatePS] = useMutation(UPDATE_PS);
    const [deletePS] = useMutation(DELETE_PS);

    // Check if the project is expired (ended more than 30 days ago)
    useEffect(() => {
        if (det?.project?.endDate) {
            const endDate = new Date(det.project.endDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            if (endDate < thirtyDaysAgo) {
                setIsProjectExpired(true);
                toast.warning("Цей проект був завершений більше 30 днів тому. Редагування обмежено.");
            } else {
                setIsProjectExpired(false);
            }
        }
    }, [det?.project?.endDate]);

    useEffect(() => {
        if (det?.project) {
            const p = det.project;
            setProject({
                name: p.name,
                description: p.description || "",
                clientId: p.client.id,
                projectTypeId: p.projectType.id,
                projectStatusId: p.status.id,
                managerId: p.manager?.id || "",
                estimateCost: p.estimateCost?.toString() || "",
                cost: p.cost?.toString() || "",
                registrationDate: p.registrationDate,
                startDate: p.startDate || "",
                endDate: p.endDate || "",
                paymentDeadline: p.paymentDeadline || "",
                services: p.projectServices.map(ps => ({
                    id: ps.id,
                    serviceId: ps.service.id,
                    amount: ps.amount,
                    initialAmount: ps.amount
                }))
            });

            // Save initial status ID for comparison
            setInitialStatusId(p.status.id);
        }
    }, [det]);

    const handleChange = e => {
        const { name, value } = e.target;

        setProject(prev => ({ ...prev, [name]: value }));

        // Clear error for the field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const addServiceRow = () =>
        setProject(prev => ({
            ...prev,
            services: [...prev.services, { serviceId: "", amount: 1, initialAmount: 1 }]
        }));

    const updateServiceRow = (i, field, val) =>
        setProject(prev => {
            const services = [...prev.services];
            if (field === "amount") {
                const parsed = parseInt(val, 10);
                const min = services[i].initialAmount;
                if (parsed < min) {
                    toast.error(`❌ Неможливо зменшити кількість нижче початкової (${min}). Ці сервіси вже замовлені.`);
                    return prev;
                }
                services[i][field] = parsed;
            } else if (field === "serviceId") {
                services[i][field] = val;
            }

            // Clear error for this service
            setInvalidServiceIndexes(invalids => invalids.filter(idx => idx !== i));
            return { ...prev, services };
        });

    const removeServiceRow = async i => {
        const services = [...project.services];
        const srv = services[i];
        if (srv.id) {
            try {
                await deletePS({ variables: { id: +srv.id } });
            } catch (err) {
                console.error(err);
                toast.error(`❌ Сервіс не видалено: ${err.message}`);
            }
        }
        services.splice(i, 1);
        setProject(prev => ({ ...prev, services }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation based on the UpdateProjectInput interface
        if (!project.name.trim()) newErrors.name = "Назва проекту обов'язкова";
        if (!project.clientId) newErrors.clientId = "Клієнт обов'язковий";
        if (!project.projectTypeId) newErrors.projectTypeId = "Тип проекту обов'язковий";

        // Date validations
        if (project.startDate && project.endDate) {
            if (new Date(project.startDate) > new Date(project.endDate)) {
                newErrors.endDate = "Дата закінчення не може бути раніше дати початку";
            }
        }

        // Cost validations
        if (project.estimateCost && isNaN(parseFloat(project.estimateCost))) {
            newErrors.estimateCost = "Бюджет проекту має бути числом";
        }
        if (project.cost && isNaN(parseFloat(project.cost))) {
            newErrors.cost = "Вартість проекту має бути числом";
        }

        // Validate services
        const invalids = project.services
            .map((s, idx) => (!s.serviceId ? idx : -1))
            .filter(idx => idx !== -1);

        if (invalids.length) {
            setInvalidServiceIndexes(invalids);
            newErrors.services = "Виберіть тип для всіх сервісів";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            // Display error messages
            Object.values(newErrors).forEach(message => {
                toast.error(message);
            });
            return false;
        }

        return true;
    };

    const handleSave = async e => {
        e.preventDefault();

        // Check if project is expired
        if (isProjectExpired) {
            toast.error("Неможливо редагувати проект, який завершений більше 30 днів тому");
            return;
        }

        if (!validateForm()) return;

        setInvalidServiceIndexes([]);
        setSaving(true);

        try {
            // Create the input object based on UpdateProjectInput interface
            const updateInput = {
                name: project.name,
                clientId: project.clientId,
                projectTypeId: project.projectTypeId,
                description: project.description || null,
                cost: project.cost ? parseFloat(project.cost) : null,
                estimateCost: project.estimateCost ? parseFloat(project.estimateCost) : null,
                paymentDeadline: project.paymentDeadline || null
            };

            // Only include optional fields if they have values
            if (project.managerId) {
                updateInput.managerId = project.managerId;
            }

            if (project.projectStatusId) {
                updateInput.statusId = project.projectStatusId;
            }

            await updateProject({
                variables: {
                    id: projectId,
                    input: updateInput
                }
            });
        } catch (err) {
            console.error(err);
            toast.error(`❌ Проєкт не оновлено: ${err.message}`);
            setSaving(false);
            return;
        }

        // Update or create project services
        for (const s of project.services) {
            try {
                if (s.id) {
                    await updatePS({ variables: { id: +s.id, input: { amount: +s.amount } } });
                } else {
                    await createPS({
                        variables: {
                            input: {
                                projectId: +projectId,
                                serviceId: +s.serviceId,
                                amount: +s.amount
                            }
                        }
                    });
                }
            } catch (err) {
                console.error(err);
                const name = ref.services.find(x => x.id === s.serviceId)?.serviceName;
                toast.error(`❌ Сервіс "${name}" не збережено: ${err.message}`);
            }
        }

        try {
            await client.refetchQueries({ include: ["GetProjectServices","GetProjectDetails"] });
        } catch {}

        toast.success("✅ Проект успішно оновлено");
        onUpdated?.();
        onClose();
        setSaving(false);
    };

    if (!isOpen) return null;
    if (refLoading || detLoading) return (
        <Modal isOpen title="Редагування проєкту" onClose={onClose}>
            <p>Завантаження…</p>
        </Modal>
    );

    return (
        <Modal isOpen onClose={onClose} title="✏️ Редагувати проєкт" size="large">
            <form onSubmit={handleSave} className="edit-project-form">
                {/* Required fields according to the UpdateProjectInput interface */}
                <div className="mb-2">
                    <label className="form-label">Назва*</label>
                    <input
                        className={`form-control ${errors.name ? "has-error" : ""}`}
                        name="name"
                        value={project.name}
                        onChange={handleChange}
                        disabled={isProjectExpired}
                        required
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="mb-2">
                    <label className="form-label">Опис</label>
                    <textarea
                        className="form-control"
                        name="description"
                        rows="2"
                        value={project.description}
                        onChange={handleChange}
                        disabled={isProjectExpired}
                    />
                </div>

                <SelectWithModalCreate
                    label="Клієнт*"
                    options={ref.clients}
                    value={project.clientId}
                    onChange={id => {
                        setProject(p => ({ ...p, clientId: id }));
                        if (errors.clientId) {
                            setErrors(prev => ({ ...prev, clientId: null }));
                        }
                    }}
                    onCreateStart={val => {
                        setPrefillClientName(val);
                        setShowCreateClient(true);
                    }}
                    disabled={isProjectExpired}
                />
                {errors.clientId && <div className="error-message">{errors.clientId}</div>}

                <SelectWithCreate
                    label="Тип проєкту*"
                    options={ref.projectTypes}
                    value={project.projectTypeId}
                    onChange={v => {
                        setProject(p => ({ ...p, projectTypeId: v }));
                        if (errors.projectTypeId) {
                            setErrors(prev => ({ ...prev, projectTypeId: null }));
                        }
                    }}
                    createMutation={CREATE_PROJECT_TYPE}
                    refetchOptions={refetch}
                    disabled={isProjectExpired}
                />
                {errors.projectTypeId && <div className="error-message">{errors.projectTypeId}</div>}

                <div className="mb-2">
                    <label className="form-label">Статус</label>
                    <select
                        className={`form-select ${errors.projectStatusId ? "has-error" : ""}`}
                        name="projectStatusId"
                        value={project.projectStatusId}
                        onChange={handleChange}
                        disabled={isProjectExpired}
                    >
                        <option value="">Виберіть статус</option>
                        {ref.projectStatuses.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    {errors.projectStatusId && <div className="error-message">{errors.projectStatusId}</div>}
                </div>

                <div className="mb-2">
                    <label className="form-label">Менеджер</label>
                    <select
                        className={`form-select ${errors.managerId ? "has-error" : ""}`}
                        name="managerId"
                        value={project.managerId}
                        onChange={handleChange}
                        disabled={isProjectExpired}
                    >
                        <option value="">Виберіть менеджера</option>
                        {ref.workersByPosition.map(w => (
                            <option key={w.id} value={w.id}>{w.name} {w.surname}</option>
                        ))}
                    </select>
                    {errors.managerId && <div className="error-message">{errors.managerId}</div>}
                </div>

                <div className="row g-2 mb-3">
                    <div className="col">
                        <label className="form-label">Дата початку</label>
                        <DatePicker
                            selected={project.startDate ? new Date(project.startDate) : null}
                            onChange={date => {
                                setProject(prev => ({
                                    ...prev,
                                    startDate: date ? date.toISOString().split("T")[0] : ""
                                }));
                            }}
                            placeholderText="Виберіть дату початку"
                            disabled={isProjectExpired}
                        />
                    </div>
                    <div className="col">
                        <label className="form-label">Дата завершення</label>
                        <DatePicker
                            selected={project.endDate ? new Date(project.endDate) : null}
                            onChange={date => {
                                setProject(prev => ({
                                    ...prev,
                                    endDate: date ? date.toISOString().split("T")[0] : ""
                                }));
                                if (errors.endDate) {
                                    setErrors(prev => ({ ...prev, endDate: null }));
                                }
                            }}
                            placeholderText="Виберіть дату завершення"
                            minDate={project.startDate ? new Date(project.startDate) : null}
                            disabled={isProjectExpired}
                        />
                        {errors.endDate && <div className="error-message">{errors.endDate}</div>}
                    </div>
                    <div className="col">
                        <label className="form-label">Строк оплати</label>
                        <DatePicker
                            selected={project.paymentDeadline ? new Date(project.paymentDeadline) : null}
                            onChange={date => {
                                setProject(prev => ({
                                    ...prev,
                                    paymentDeadline: date ? date.toISOString().split("T")[0] : ""
                                }));
                            }}
                            placeholderText="Виберіть строк оплати"
                            disabled={isProjectExpired}
                        />
                    </div>
                </div>

                <div className="row g-2 mb-3">
                    <div className="col">
                        <label className="form-label">Оцінка витрат, ₴</label>
                        <input
                            type="number"
                            step="0.01"
                            className={`form-control ${errors.estimateCost ? "has-error" : ""}`}
                            name="estimateCost"
                            min="0"
                            value={project.estimateCost}
                            onChange={handleChange}
                            disabled={isProjectExpired}
                        />
                        {errors.estimateCost && <div className="error-message">{errors.estimateCost}</div>}
                    </div>
                    <div className="col">
                        <label className="form-label">Фактичні витрати, ₴</label>
                        <input
                            type="number"
                            step="0.01"
                            className={`form-control ${errors.cost ? "has-error" : ""}`}
                            name="cost"
                            min="0"
                            value={project.cost}
                            onChange={handleChange}
                            disabled={isProjectExpired}
                        />
                        {errors.cost && <div className="error-message">{errors.cost}</div>}
                    </div>
                </div>

                <h5 className="mt-3">Сервіси проєкту</h5>
                {errors.services && <div className="error-message mb-2">{errors.services}</div>}
                {project.services.map((s, idx) => (
                    <div key={idx} className="d-flex align-items-end gap-2 mb-2">
                        <select
                            className={`form-select ${invalidServiceIndexes.includes(idx) ? "has-error" : ""}`}
                            style={{ flex: 1 }}
                            value={s.serviceId}
                            onChange={(e) => updateServiceRow(idx, "serviceId", e.target.value)}
                            disabled={!!s.id || isProjectExpired}  // Disabled if already ordered or project expired
                        >
                            <option value="">
                                {s.id
                                    ? ref.services.find(x => x.id === s.serviceId)?.serviceName
                                    : "— виберіть сервіс —"}
                            </option>
                            {!s.id && ref.services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.serviceName} (₴{service.estimateCost})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min={s.initialAmount || 1}
                            className="form-control"
                            style={{ width: 90 }}
                            value={s.amount}
                            onChange={e => updateServiceRow(idx, "amount", e.target.value)}
                            disabled={isProjectExpired}
                        />
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeServiceRow(idx)}
                            disabled={isProjectExpired}
                        >
                            🗑️
                        </Button>

                        {s.id && s.initialAmount > 0 && (
                            <span className="text-muted">
                                Мін. кількість: {s.initialAmount}
                            </span>
                        )}
                    </div>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={addServiceRow}
                    disabled={isProjectExpired}
                >
                    ➕ Додати сервіс
                </Button>

                <div className="mt-4 d-flex gap-2 justify-content-end">
                    <Button variant="outline" onClick={onClose}>Скасувати</Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSaving || isProjectExpired}
                    >
                        {isSaving ? "Збереження…" : "💾 Оновити проєкт"}
                    </Button>
                </div>

                {isProjectExpired && (
                    <div className="alert alert-warning mt-3">
                        <strong>Увага!</strong> Цей проект був завершений більше 30 днів тому і не може бути відредагований.
                    </div>
                )}
            </form>

            <Modal isOpen={showCreateClient} onClose={() => setShowCreateClient(false)} title="➕ Новий клієнт">
                <ClientModal
                    client={{ prefillName: prefillClientName }}
                    editMode={false}
                    onSave={c => {
                        if (c?.id) {
                            setProject(p => ({ ...p, clientId: c.id }));
                            if (errors.clientId) {
                                setErrors(prev => ({ ...prev, clientId: null }));
                            }
                            refetch();
                            toast.success("✅ Клієнта створено");
                        }
                        setShowCreateClient(false);
                    }}
                    onCancel={() => setShowCreateClient(false)}
                />
            </Modal>
        </Modal>
    );
}