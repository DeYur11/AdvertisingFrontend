import { useState, useEffect } from "react";
import {useQuery, useMutation, gql, useApolloClient} from "@apollo/client";
import SelectWithCreate from "../../../components/common/SelectWithCreate";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ClientModal from "./ClientModal/ClientModal";
import SelectWithModalCreate from "../../../components/common/SelectWithModalCreate";
import "./EditProjectModal.css";

/* ─── gql ───────────────────────────────────────────────────────────── */
const GET_PROJECT_REFERENCE_DATA = gql`
    query GetProjectReferenceData {
        clients { id name }
        projectTypes { id name }
        projectStatuses { id name }
        services { id serviceName estimateCost }
        workersByPosition(position:"Project Manager") {
            id name surname
        }
    }
`;

const GET_PROJECT_DETAILS = gql`
    query GetProjectDetails($id: ID!) {
        project(id:$id) {
            id
            name
            description
            cost
            estimateCost
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
    mutation UpdateProject($id:ID!,$input:UpdateProjectInput!){
        updateProject(id:$id,input:$input){ id }
    }
`;

const CREATE_PROJECT_TYPE = gql`
    mutation($input:CreateProjectTypeInput!){
        createProjectType(input:$input){ id name }
    }
`;

const CREATE_PS = gql`
    mutation($input:CreateProjectServiceInput!){
        createProjectService(input:$input){ id }
    }
`;

const UPDATE_PS = gql`
    mutation($id:ID!,$input:UpdateProjectServiceInput!){
        updateProjectService(id:$id,input:$input){ id }
    }
`;

const DELETE_PS = gql`
    mutation($id:ID!){
        deleteProjectService(id:$id)
    }
`;

/* ─── компонент ─────────────────────────────────────────────────────── */
export default function EditProjectModal({ isOpen, projectId, onClose, onUpdated }) {
    const [project, setProject] = useState({
        name: "", description: "", clientId: "",
        projectTypeId: "", projectStatusId: "",
        cost: "", estimateCost: "", paymentDeadline: "",
        managerId: "", services: []
    });
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [prefillClientName, setPrefillClientName] = useState("");
    const [isSaving, setSaving] = useState(false);
    const client = useApolloClient();
    const { data: ref, loading: refLoading, refetch } = useQuery(GET_PROJECT_REFERENCE_DATA);
    const { data: det, loading: detLoading } = useQuery(GET_PROJECT_DETAILS, {
        variables: { id: projectId },
        skip: !projectId,
        fetchPolicy: "network-only"
    });

    const [updateProject] = useMutation(UPDATE_PROJECT);
    const [createPS] = useMutation(CREATE_PS);
    const [updatePS] = useMutation(UPDATE_PS);
    const [deletePS] = useMutation(DELETE_PS);

    useEffect(() => {
        if (det?.project) {
            const p = det.project;
            setProject({
                name: p.name ?? "",
                description: p.description ?? "",
                clientId: p.client?.id ?? "",
                projectTypeId: p.projectType?.id ?? "",
                projectStatusId: p.status?.id ?? "",
                cost: p.cost != null ? p.cost.toString() : "",
                estimateCost: p.estimateCost != null ? p.estimateCost.toString() : "",
                paymentDeadline: p.paymentDeadline ?? "",
                managerId: p.manager?.id ?? "",
                services: p.projectServices.map(ps => ({
                    id: ps.id,
                    serviceId: ps.service.id,
                    amount: ps.amount
                }))
            });
        }
    }, [det]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
    };

    const addServiceRow = () =>
        setProject(prev => ({ ...prev, services: [...prev.services, { serviceId: "", amount: 1 }] }));

    const updateServiceRow = (i, f, v) =>
        setProject(prev => {
            const s = [...prev.services]; s[i][f] = v; return { ...prev, services: s };
        });

    const removeServiceRow = i =>
        setProject(prev => {
            const s = [...prev.services];
            if (s[i].id) deletePS({ variables: { id: +s[i].id } });
            s.splice(i, 1);
            return { ...prev, services: s };
        });

    const handleSave = async (e) => {
        e.preventDefault();
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
                        projectStatusId: +project.projectStatusId,
                        cost: project.cost !== "" ? +project.cost : null,
                        estimateCost: project.estimateCost !== "" ? +project.estimateCost : null,
                        paymentDeadline: project.paymentDeadline || null,
                        managerId: project.managerId ? +project.managerId : null
                    }
                }
            });

            for (const s of project.services) {
                if (!s.serviceId) continue;
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
            }

            // 🔁 REFRESH даних про сервіси та проект
            await client.refetchQueries({
                include: ["GetProjectServices", "GetProjectDetails"]
            });

            onUpdated?.();
            onClose();
        } catch (err) {
            alert(err.message);
        }
        setSaving(false);
    };


    if (!isOpen) return null;
    if (refLoading || detLoading) return <Modal isOpen title="Edit Project" onClose={onClose}><p>Loading…</p></Modal>;

    return (
        <Modal isOpen onClose={onClose} title="✏️ Edit Project" size="large">
            <form onSubmit={handleSave} className="edit-project-form">
                <div className="mb-2">
                    <label className="form-label">Name*</label>
                    <input className="form-control" name="name" value={project.name} onChange={handleChange} required />
                </div>

                <div className="mb-2">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" name="description" rows="2" value={project.description} onChange={handleChange} />
                </div>

                <SelectWithModalCreate label="Client*" options={ref.clients} value={project.clientId}
                                       onChange={id => setProject(p => ({ ...p, clientId: id }))}
                                       onCreateStart={val => { setPrefillClientName(val); setShowCreateClient(true); }} />

                <SelectWithCreate label="Project Type*" options={ref.projectTypes} value={project.projectTypeId}
                                  onChange={v => setProject(p => ({ ...p, projectTypeId: v }))} createMutation={CREATE_PROJECT_TYPE} refetchOptions={refetch} />

                <div className="mb-2">
                    <label className="form-label">Status*</label>
                    <select className="form-select" name="projectStatusId" value={project.projectStatusId} onChange={handleChange} required>
                        <option value="">Select Status</option>
                        {ref.projectStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="form-label">Manager</label>
                    <select className="form-select" name="managerId" value={project.managerId} onChange={handleChange}>
                        <option value="">— none —</option>
                        {ref.workersByPosition.map(w => <option key={w.id} value={w.id}>{w.name} {w.surname}</option>)}
                    </select>
                </div>

                <div className="row g-2 mb-2">
                    <div className="col">
                        <label className="form-label">Payment Deadline</label>
                        <input type="date" className="form-control" name="paymentDeadline" value={project.paymentDeadline} onChange={handleChange} />
                    </div>
                    <div className="col">
                        <label className="form-label">Estimate, $</label>
                        <input type="number" className="form-control" name="estimateCost" min="0" value={project.estimateCost} onChange={handleChange} />
                    </div>
                    <div className="col">
                        <label className="form-label">Cost, $</label>
                        <input type="number" className="form-control" name="cost" min="0" value={project.cost} onChange={handleChange} />
                    </div>
                </div>

                <h5 className="mt-3">Project Services</h5>
                {project.services.map((s, idx) => (
                    <div key={idx} className="d-flex align-items-end gap-2 mb-2">
                        <select className="form-select" style={{ flex: 1 }} value={s.serviceId} onChange={e => updateServiceRow(idx, "serviceId", e.target.value)}>
                            <option value="">— select service —</option>
                            {ref.services.map(sv => <option key={sv.id} value={sv.id}>{sv.serviceName} (${sv.estimateCost})</option>)}
                        </select>
                        <input type="number" min="1" className="form-control" style={{ width: 90 }} value={s.amount} onChange={e => updateServiceRow(idx, "amount", e.target.value)} />
                        <Button variant="danger" size="sm" onClick={() => removeServiceRow(idx)}>🗑️</Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={addServiceRow}>➕ Add Service</Button>

                <div className="mt-4 d-flex gap-2 justify-content-end">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "💾 Update Project"}</Button>
                </div>
            </form>

            <Modal isOpen={showCreateClient} onClose={() => setShowCreateClient(false)} title="➕ New Client">
                <ClientModal client={{ prefillName: prefillClientName }} editMode={false}
                             onSave={c => { if (c?.id) { setProject(p => ({ ...p, clientId: c.id })); refetch(); } setShowCreateClient(false); }}
                             onCancel={() => setShowCreateClient(false)} />
            </Modal>
        </Modal>
    );
}
