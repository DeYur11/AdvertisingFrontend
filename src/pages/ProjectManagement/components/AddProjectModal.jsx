import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import SelectWithCreate from "../../../components/common/SelectWithCreate";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ClientModal from "../components/ClientModal/ClientModal";
import SelectWithModalCreate from "../../../components/common/SelectWithModalCreate";

import {
    GET_PROJECT_REFERENCE_DATA,
    CREATE_PROJECT,
    CREATE_PROJECT_SERVICE,
    CREATE_PROJECT_TYPE
} from "../graphql/projectCreate.gql";

export default function AddProjectModal({ isOpen, onClose, onCreated }) {
    const [project, setProject] = useState({
        name: "",
        description: "",
        clientId: "",
        managerId: "",
        projectTypeId: "",
        estimateCost: "",
        paymentDeadline: "",
        services: []
    });

    const [showCreateClient, setShowCreateClient] = useState(false);
    const [prefillClientName, setPrefillClientName] = useState("");

    const { data, loading, error, refetch } = useQuery(GET_PROJECT_REFERENCE_DATA);
    const [createProject] = useMutation(CREATE_PROJECT);
    const [createProjectService] = useMutation(CREATE_PROJECT_SERVICE);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject((prev) => ({ ...prev, [name]: value }));
    };

    const addServiceRow = () => {
        setProject((prev) => ({
            ...prev,
            services: [...prev.services, { serviceId: "", amount: 1 }]
        }));
    };

    const updateServiceRow = (idx, field, val) => {
        setProject((prev) => {
            const copy = [...prev.services];
            copy[idx][field] = val;
            return { ...prev, services: copy };
        });
    };

    const removeServiceRow = (idx) => {
        setProject((prev) => {
            const copy = [...prev.services];
            copy.splice(idx, 1);
            return { ...prev, services: copy };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { data: created } = await createProject({
                variables: {
                    input: {
                        name: project.name,
                        description: project.description,
                        clientId: +project.clientId,
                        managerId: project.managerId ? +project.managerId : null,
                        projectTypeId: +project.projectTypeId,
                        estimateCost: +project.estimateCost || 0,
                        paymentDeadline: project.paymentDeadline,
                        cost: null
                    }
                }
            });

            const projectId = created?.createProject?.id;
            if (projectId && project.services.length) {
                await Promise.all(
                    project.services
                        .filter((s) => s.serviceId && s.amount)
                        .map((s) =>
                            createProjectService({
                                variables: {
                                    input: {
                                        projectId: +projectId,
                                        serviceId: +s.serviceId,
                                        amount: +s.amount
                                    }
                                }
                            })
                        )
                );
            }

            onClose();
            if (onCreated) onCreated();
        } catch (err) {
            console.error(err);
            alert("❌ Failed to create");
        }
    };

    if (!isOpen) return null;
    if (loading) return <Modal isOpen onClose={onClose} title="Add Project"><p>Loading...</p></Modal>;
    if (error) return <Modal isOpen onClose={onClose} title="Error"><p>{error.message}</p></Modal>;

    return (
        <Modal isOpen onClose={onClose} title="➕ New Project" size="large">
            <div className="add-project-form">
                <form onSubmit={handleSave}>
                    <div className="mb-2">
                        <label className="form-label">Name*</label>
                        <input className="form-control" name="name" value={project.name} onChange={handleChange} required />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" name="description" rows="2" value={project.description} onChange={handleChange} />
                    </div>

                    <div className="d-flex align-items-end gap-2 mb-2">
                        <div style={{ flex: 1 }}>
                            <SelectWithModalCreate
                                label="Client*"
                                options={data.clients}
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
                        options={data.projectTypes}
                        value={project.projectTypeId}
                        onChange={(val) => setProject((p) => ({ ...p, projectTypeId: val }))}
                        createMutation={CREATE_PROJECT_TYPE}
                        refetchOptions={refetch}
                    />

                    <div className="mb-2">
                        <label className="form-label">Manager</label>
                        <select
                            className="form-select"
                            value={project.managerId}
                            onChange={(e) => setProject((p) => ({ ...p, managerId: e.target.value }))}
                        >
                            <option value="">— none —</option>
                            {data.workers.map((w) => (
                                <option key={w.id} value={w.id}>{w.name} {w.surname}</option>
                            ))}
                        </select>
                    </div>

                    <div className="row g-2">
                        <div className="col">
                            <label className="form-label">Payment Deadline</label>
                            <input type="date" className="form-control" name="paymentDeadline" value={project.paymentDeadline} onChange={handleChange} />
                        </div>
                        <div className="col">
                            <label className="form-label">Estimate, $</label>
                            <input type="number" className="form-control" name="estimateCost" min="0" value={project.estimateCost} onChange={handleChange} />
                        </div>
                    </div>

                    <h5 className="mt-3">Project Services</h5>
                    {project.services.map((srv, idx) => (
                        <div key={idx} className="d-flex align-items-end gap-2 mb-2">
                            <select
                                className="form-select"
                                value={srv.serviceId}
                                onChange={(e) => updateServiceRow(idx, "serviceId", e.target.value)}
                                style={{ flex: 1 }}
                            >
                                <option value="">— select service —</option>
                                {data.services.map((s) => (
                                    <option key={s.id} value={s.id}>{s.serviceName} (${s.estimateCost})</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                className="form-control"
                                style={{ width: 90 }}
                                value={srv.amount}
                                onChange={(e) => updateServiceRow(idx, "amount", e.target.value)}
                            />
                            <Button variant="danger" size="sm" onClick={() => removeServiceRow(idx)}>
                                🗑️
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addServiceRow}>➕ Add Service</Button>

                    <div className="mt-4 d-flex gap-2 justify-content-end">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" type="submit">💾 Save Project</Button>
                    </div>
                </form>
            </div>

            {/* Modal поза <form> для уникнення вкладення */}
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
