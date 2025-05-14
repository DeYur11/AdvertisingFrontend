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
            paymentDeadline
            client { id }
            projectType { id }
            status { id }
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
        paymentDeadline: "",
        services: []
    });
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [prefillClientName, setPrefillClientName] = useState("");
    const [isSaving, setSaving] = useState(false);
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
                paymentDeadline: p.paymentDeadline || "",
                services: p.projectServices.map(ps => ({
                    id: ps.id,
                    serviceId: ps.service.id,
                    amount: ps.amount,
                    initialAmount: ps.amount
                }))
            });
        }
    }, [det]);

    const handleChange = e => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
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
                    toast.error(`❌ Неможливо зменшити нижче початкового (${min})`);
                    return prev;
                }
                services[i][field] = parsed;
            }
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
        const invalids = project.services
            .map((s, idx) => (!s.serviceId ? idx : -1))
            .filter(idx => idx !== -1);
        if (invalids.length) {
            setInvalidServiceIndexes(invalids);
            toast.error("❌ Виберіть тип для всіх сервісів.");
            return false;
        }
        return true;
    };

    const handleSave = async e => {
        e.preventDefault();
        if (!validateForm()) return;
        setInvalidServiceIndexes([]);
        setSaving(true);

        try {
            await updateProject({
                variables: {
                    id: projectId,
                    input: {
                        name: project.name,
                        description: project.description || null,
                        clientId: +project.clientId,
                        projectTypeId: +project.projectTypeId,
                        statusId: +project.projectStatusId,
                        managerId: project.managerId ? +project.managerId : null,
                        estimateCost: project.estimateCost ? +project.estimateCost : null,
                        cost: project.cost ? +project.cost : null,
                        paymentDeadline: project.paymentDeadline || null
                    }
                }
            });
        } catch (err) {
            console.error(err);
            toast.error(`❌ Проєкт не оновлено: ${err.message}`);
            setSaving(false);
            return;
        }

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

        toast.success("✅ Проєкт успішно оновлено");
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
                <div className="mb-2">
                    <label className="form-label">Назва*</label>
                    <input
                        className="form-control"
                        name="name"
                        value={project.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-2">
                    <label className="form-label">Опис</label>
                    <textarea
                        className="form-control"
                        name="description"
                        rows="2"
                        value={project.description}
                        onChange={handleChange}
                    />
                </div>

                <SelectWithModalCreate
                    label="Клієнт*"
                    options={ref.clients}
                    value={project.clientId}
                    onChange={id => setProject(p => ({ ...p, clientId: id }))}
                    onCreateStart={val => {
                        setPrefillClientName(val);
                        setShowCreateClient(true);
                    }}
                />

                <SelectWithCreate
                    label="Тип проєкту*"
                    options={ref.projectTypes}
                    value={project.projectTypeId}
                    onChange={v => setProject(p => ({ ...p, projectTypeId: v }))}
                    createMutation={CREATE_PROJECT_TYPE}
                    refetchOptions={refetch}
                />

                <div className="mb-2">
                    <label className="form-label">Статус*</label>
                    <select
                        className="form-select"
                        name="projectStatusId"
                        value={project.projectStatusId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Виберіть статус</option>
                        {ref.projectStatuses.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="form-label">Менеджер</label>
                    <select
                        className="form-select"
                        name="managerId"
                        value={project.managerId}
                        onChange={handleChange}
                    >
                        <option value="">— немає —</option>
                        {ref.workersByPosition.map(w => (
                            <option key={w.id} value={w.id}>{w.name} {w.surname}</option>
                        ))}
                    </select>
                </div>

                <div className="row g-2 mb-3">
                    <div className="col">
                        <label className="form-label">Строк оплати</label>
                        <DatePicker
                            selected={project.paymentDeadline ? new Date(project.paymentDeadline) : null}
                            onChange={date =>
                                setProject(p => ({ ...p, paymentDeadline: date?.toISOString().split("T")[0] || "" }))
                            }
                            placeholderText="Виберіть строк оплати"
                            minDate={project.registrationDate ? new Date(project.registrationDate) : null}
                        />
                    </div>
                    <div className="col">
                        <label className="form-label">Оцінка витрат, $</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            name="estimateCost"
                            min="0"
                            value={project.estimateCost}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col">
                        <label className="form-label">Фактичні витрати, $</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            name="cost"
                            min="0"
                            value={project.cost}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <h5 className="mt-3">Сервіси проєкту</h5>
                {project.services.map((s, idx) => (
                    <div key={idx} className="d-flex align-items-end gap-2 mb-2">
                        <select
                            className={`form-select ${invalidServiceIndexes.includes(idx) ? "is-invalid" : ""}`}
                            style={{ flex: 1 }}
                            value={s.serviceId}
                            disabled={!!s.id}  // блокуємо зміну типу для вже замовлених
                        >
                            <option value="">
                                {s.id
                                    ? ref.services.find(x => x.id === s.serviceId)?.serviceName
                                    : "— виберіть сервіс —"}
                            </option>
                        </select>
                        <input
                            type="number"
                            min={s.initialAmount}
                            className="form-control"
                            style={{ width: 90 }}
                            value={s.amount}
                            onChange={e => updateServiceRow(idx, "amount", e.target.value)}
                        />
                        <Button variant="danger" size="sm" onClick={() => removeServiceRow(idx)}>
                            🗑️
                        </Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={addServiceRow}>
                    ➕ Додати сервіс
                </Button>

                <div className="mt-4 d-flex gap-2 justify-content-end">
                    <Button variant="outline" onClick={onClose}>Скасувати</Button>
                    <Button variant="primary" type="submit" disabled={isSaving}>
                        {isSaving ? "Збереження…" : "💾 Оновити проєкт"}
                    </Button>
                </div>
            </form>

            <Modal isOpen={showCreateClient} onClose={() => setShowCreateClient(false)} title="➕ Новий клієнт">
                <ClientModal
                    client={{ prefillName: prefillClientName }}
                    editMode={false}
                    onSave={c => {
                        if (c?.id) {
                            setProject(p => ({ ...p, clientId: c.id }));
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
