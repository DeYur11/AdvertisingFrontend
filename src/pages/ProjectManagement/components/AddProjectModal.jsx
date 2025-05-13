import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
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

    const [formErrors, setFormErrors] = useState({});
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [prefillClientName, setPrefillClientName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [currentTotalCost, setCurrentTotalCost] = useState(0);
    const [remainingBudget, setRemainingBudget] = useState(0);
    const [exceedsBudget, setExceedsBudget] = useState(false);

    const { data, loading, error, refetch } = useQuery(GET_PROJECT_REFERENCE_DATA, {
        onError: (err) => {
            toast.error(`Помилка завантаження даних: ${err.message}`);
        }
    });

    const [createProject] = useMutation(CREATE_PROJECT);
    const [createProjectService] = useMutation(CREATE_PROJECT_SERVICE);

    // Розрахунок поточної вартості та залишку бюджету
    useEffect(() => {
        if (data && project.services.length > 0) {
            let total = 0;
            project.services.forEach(service => {
                if (service.serviceId && service.amount) {
                    const serviceObj = data.services.find(s => s.id === service.serviceId);
                    if (serviceObj) {
                        total += serviceObj.estimateCost * service.amount;
                    }
                }
            });

            setCurrentTotalCost(total);

            const estimateValue = parseFloat(project.estimateCost) || 0;
            setRemainingBudget(estimateValue > 0 ? estimateValue - total : 0);
            setExceedsBudget(estimateValue > 0 && total > estimateValue);
        } else {
            setCurrentTotalCost(0);
            setRemainingBudget(parseFloat(project.estimateCost) || 0);
            setExceedsBudget(false);
        }
    }, [project.services, project.estimateCost, data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject((prev) => ({ ...prev, [name]: value }));
        // Очищаємо помилку поля при введенні
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
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

        // Очищаємо помилку послуги при зміні
        setFormErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`service_${idx}`];
            return newErrors;
        });
    };

    const removeServiceRow = (idx) => {
        setProject((prev) => {
            const copy = [...prev.services];
            copy.splice(idx, 1);
            return { ...prev, services: copy };
        });
    };

    const validateForm = () => {
        const errors = {};

        if (!project.name.trim()) {
            errors.name = "Назва проекту обов'язкова";
        }

        if (!project.clientId) {
            errors.clientId = "Клієнт обов'язковий";
        }

        if (!project.projectTypeId) {
            errors.projectTypeId = "Тип проекту обов'язковий";
        }

        // Перевірка послуг
        project.services.forEach((service, idx) => {
            if (service.serviceId && (!service.amount || service.amount <= 0)) {
                errors[`service_${idx}`] = "Кількість має бути більше 0";
            }
        });

        // Перевірка на перевищення бюджету
        if (exceedsBudget) {
            errors.budget = "Вартість послуг перевищує бюджет проекту";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Будь ласка, виправте помилки у формі");
            return;
        }

        setIsSaving(true);

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
                        cost: currentTotalCost || null // Записуємо кінцеву вартість на основі вибраних послуг
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

            toast.success("Проект успішно створено");
            onClose();
            if (onCreated) onCreated();
        } catch (err) {
            console.error(err);
            const errorMessage = err.graphQLErrors?.[0]?.message || err.message || "Невідома помилка";
            toast.error(`Помилка при збереженні проекту: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const closeModal = () => {
        // Скидаємо помилки при закритті модалки
        setFormErrors({});
        onClose();
    };

    if (!isOpen) return null;
    if (loading) return <Modal isOpen onClose={closeModal} title="Додавання проекту"><p>Завантаження...</p></Modal>;
    if (error) return <Modal isOpen onClose={closeModal} title="Помилка"><p>{error.message}</p></Modal>;

    return (
        <Modal isOpen onClose={closeModal} title="➕ Новий проект" size="large">
            <div className="add-project-form">
                <form onSubmit={handleSave} noValidate>
                    <div className="mb-2">
                        <label className="form-label">Назва*</label>
                        <input
                            className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                            name="name"
                            value={project.name}
                            onChange={handleChange}
                            required
                        />
                        {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
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

                    <div className="d-flex align-items-end gap-2 mb-2">
                        <div style={{ flex: 1 }}>
                            <SelectWithModalCreate
                                label="Клієнт*"
                                options={data.clients}
                                value={project.clientId}
                                onChange={(id) => {
                                    setProject((p) => ({ ...p, clientId: id }));
                                    setFormErrors((prev) => {
                                        const newErrors = { ...prev };
                                        delete newErrors.clientId;
                                        return newErrors;
                                    });
                                }}
                                onCreateStart={(inputValue) => {
                                    setPrefillClientName(inputValue);
                                    setShowCreateClient(true);
                                }}
                                isInvalid={!!formErrors.clientId}
                                errorMessage={formErrors.clientId}
                            />
                        </div>
                    </div>

                    <SelectWithCreate
                        label="Тип проекту*"
                        options={data.projectTypes}
                        value={project.projectTypeId}
                        onChange={(val) => {
                            setProject((p) => ({ ...p, projectTypeId: val }));
                            setFormErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.projectTypeId;
                                return newErrors;
                            });
                        }}
                        createMutation={CREATE_PROJECT_TYPE}
                        refetchOptions={refetch}
                        isInvalid={!!formErrors.projectTypeId}
                        errorMessage={formErrors.projectTypeId}
                    />

                    <div className="mb-2">
                        <label className="form-label">Менеджер</label>
                        <select
                            className="form-select"
                            value={project.managerId}
                            onChange={(e) => setProject((p) => ({ ...p, managerId: e.target.value }))}
                        >
                            <option value="">— не вибрано —</option>
                            {data.workers.map((w) => (
                                <option key={w.id} value={w.id}>{w.name} {w.surname}</option>
                            ))}
                        </select>
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col">
                            <label className="form-label">Термін оплати</label>
                            <input
                                type="date"
                                className="form-control"
                                name="paymentDeadline"
                                value={project.paymentDeadline}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col">
                            <label className="form-label">Бюджет проекту, ₴</label>
                            <input
                                type="number"
                                className={`form-control ${formErrors.budget ? "is-invalid" : ""}`}
                                name="estimateCost"
                                min="0"
                                value={project.estimateCost}
                                onChange={handleChange}
                            />
                            {formErrors.budget && <div className="invalid-feedback">{formErrors.budget}</div>}
                        </div>
                    </div>

                    <h5 className="mt-3">Послуги проекту</h5>

                    {/* Інформація про бюджет та вартість */}
                    <div className="budget-info mb-3">
                        <div className={`alert ${exceedsBudget ? "alert-danger" : "alert-info"} py-2`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <span>Поточна вартість: <strong>{currentTotalCost.toLocaleString()} ₴</strong></span>
                                {parseFloat(project.estimateCost) > 0 && (
                                    <span>
                                        {exceedsBudget
                                            ? <span className="text-danger">Перевищення бюджету: <strong>{Math.abs(remainingBudget).toLocaleString()} ₴</strong></span>
                                            : <span>Залишок бюджету: <strong>{remainingBudget.toLocaleString()} ₴</strong></span>
                                        }
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {project.services.map((srv, idx) => (
                        <div key={idx} className="d-flex align-items-end gap-2 mb-2">
                            <select
                                className="form-select"
                                value={srv.serviceId}
                                onChange={(e) => updateServiceRow(idx, "serviceId", e.target.value)}
                                style={{ flex: 1 }}
                            >
                                <option value="">— виберіть послугу —</option>
                                {data.services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.serviceName} (₴{s.estimateCost})
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                className={`form-control ${formErrors[`service_${idx}`] ? "is-invalid" : ""}`}
                                style={{ width: 90 }}
                                value={srv.amount}
                                onChange={(e) => updateServiceRow(idx, "amount", e.target.value)}
                            />
                            <Button variant="danger" size="sm" onClick={() => removeServiceRow(idx)}>
                                🗑️
                            </Button>
                            {formErrors[`service_${idx}`] && (
                                <div className="invalid-feedback" style={{ display: "block" }}>
                                    {formErrors[`service_${idx}`]}
                                </div>
                            )}

                            {/* Відображення вартості конкретної послуги */}
                            {srv.serviceId && srv.amount && data.services && (
                                <div style={{ minWidth: '100px' }}>
                                    {(data.services.find(s => s.id === srv.serviceId)?.estimateCost * srv.amount).toLocaleString()} ₴
                                </div>
                            )}
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addServiceRow}>➕ Додати послугу</Button>

                    <div className="mt-4 d-flex gap-2 justify-content-end">
                        <Button variant="outline" onClick={closeModal}>Скасувати</Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSaving || exceedsBudget}
                        >
                            {isSaving ? "Збереження..." : "💾 Зберегти проект"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Модальне вікно поза <form> для уникнення вкладення */}
            <Modal
                isOpen={showCreateClient}
                onClose={() => setShowCreateClient(false)}
                title="➕ Новий клієнт"
            >
                <ClientModal
                    client={{ prefillName: prefillClientName }}
                    editMode={false}
                    onSave={(created) => {
                        if (created?.id) {
                            setProject((p) => ({ ...p, clientId: created.id }));
                            setFormErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.clientId;
                                return newErrors;
                            });
                            toast.success("Клієнт успішно створений");
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