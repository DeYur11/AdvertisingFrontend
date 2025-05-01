import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import Select from 'react-select';

const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
    }
  }
`;

export default function NewProjectForm({ onClose, onSuccess, clients, projectTypes, managers, project }) {
    const [form, setForm] = useState({
        name: project?.name || '',
        clientId: project?.client?.id || '',
        projectTypeId: project?.projectType?.id || '',
        description: project?.description || '',
        cost: project?.cost || '',
        estimateCost: project?.estimateCost || '',
        paymentDeadline: project?.paymentDeadline || '',
        managerId: project?.managerId || ''
    });

    const [createProject, { loading }] = useMutation(CREATE_PROJECT);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (selectedOption, field) => {
        setForm((prev) => ({ ...prev, [field]: selectedOption ? selectedOption.value : '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createProject({
            variables: { input: { ...form, cost: parseFloat(form.cost), estimateCost: parseFloat(form.estimateCost) } },
        });
        onSuccess?.();
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{project ? 'Редагувати проєкт' : 'Новий проєкт'}</h2>

            <label>Назва проєкту</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />

            <label>Клієнт</label>
            <Select
                options={clients}
                value={clients.find(client => client.value === form.clientId)}
                onChange={(selectedOption) => handleSelectChange(selectedOption, 'clientId')}
                placeholder="Оберіть клієнта"
                required
            />

            <label>Тип проєкту</label>
            <Select
                options={projectTypes}
                value={projectTypes.find(type => type.value === form.projectTypeId)}
                onChange={(selectedOption) => handleSelectChange(selectedOption, 'projectTypeId')}
                placeholder="Оберіть тип проєкту"
                required
            />

            <label>Опис</label>
            <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Опис проєкту"
            />

            <label>Вартість</label>
            <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                placeholder="Вартість проєкту"
                required
            />

            <label>Оціночна вартість</label>
            <input
                type="number"
                name="estimateCost"
                value={form.estimateCost}
                onChange={handleChange}
                placeholder="Оціночна вартість"
                required
            />

            <label>Термін оплати</label>
            <input
                type="date"
                name="paymentDeadline"
                value={form.paymentDeadline}
                onChange={handleChange}
            />

            <label>Менеджер</label>
            <Select
                options={managers}
                value={managers.find(manager => manager.value === form.managerId)}
                onChange={(selectedOption) => handleSelectChange(selectedOption, 'managerId')}
                placeholder="Оберіть менеджера"
            />

            <div style={{ marginTop: 20 }}>
                <button className="primary-button" type="submit" disabled={loading}>
                    {loading ? 'Збереження...' : '💾 Створити'}
                </button>
                <button className="cancel-button" type="button" onClick={onClose}>
                    ❌ Скасувати
                </button>
            </div>
        </form>
    );
}
