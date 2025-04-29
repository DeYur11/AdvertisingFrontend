import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import CreatableSelect from "../CreatableSelect";

// Запит для довідників
const GET_MATERIAL_REFERENCE_DATA = gql`
  query GetMaterialReferenceData {
    materialTypes { id name }
    licenceTypes { id name }
    usageRestrictions { id description }
    targetAudiences { id name }
    languages { id name }
  }
`;

const CREATE_TARGET_AUDIENCE = gql`
  mutation CreateTargetAudience($input: CreateTargetAudienceInput!) {
  createTargetAudience(input: $input) {
    id
    name
  }
}

`;

// Мутація на створення матеріалу
const CREATE_MATERIAL = gql`
  mutation CreateMaterial($input: CreateMaterialInput!) {
    createMaterial(input: $input) {
      id
      name
    }
  }
`;

export default function AddMaterialForm({ taskId, onAdded }) {
    const [newMaterial, setNewMaterial] = useState({
        name: "",
        description: "",
        typeId: "",
        usageRestrictionId: "",
        licenceTypeId: "",
        targetAudienceId: "",
        languageId: "",
    });

    const { loading, error, data , refetch} = useQuery(GET_MATERIAL_REFERENCE_DATA);
    const [createMaterial] = useMutation(CREATE_MATERIAL);

    if (loading) return <p>Завантаження довідників...</p>;
    if (error) return <p>Помилка при завантаженні: {error.message}</p>;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewMaterial(prev => ({ ...prev, [name]: value }));
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();

        try {
            await createMaterial({
                variables: {
                    input: {
                        ...newMaterial,
                        typeId: parseInt(newMaterial.typeId),
                        usageRestrictionId: newMaterial.usageRestrictionId ? parseInt(newMaterial.usageRestrictionId) : null,
                        licenceTypeId: newMaterial.licenceTypeId ? parseInt(newMaterial.licenceTypeId) : null,
                        targetAudienceId: newMaterial.targetAudienceId ? parseInt(newMaterial.targetAudienceId) : null,
                        languageId: newMaterial.languageId ? parseInt(newMaterial.languageId) : null,
                        taskId: parseInt(taskId),
                    },
                },
            });

            setNewMaterial({
                name: "",
                description: "",
                typeId: "",
                usageRestrictionId: "",
                licenceTypeId: "",
                targetAudienceId: "",
                languageId: "",
            });

            alert("✅ Матеріал успішно створено!");
        } catch (err) {
            console.error("❌ Створення не вдалося:", err.message);
        }
    };

    return (
        <div>
            <h6>➕ Додати новий матеріал</h6>
            <form className="mt-2" onSubmit={handleAddMaterial}>
                <div className="mb-2">
                    <label className="form-label">Назва</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={newMaterial.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-2">
                    <label className="form-label">Опис</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={newMaterial.description}
                        onChange={handleChange}
                        rows="2"
                    />
                </div>

                <div className="mb-2">
                    <label className="form-label">Тип</label>
                    <select
                        className="form-select"
                        name="typeId"
                        value={newMaterial.typeId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Оберіть тип</option>
                        {data.materialTypes.map(mt => (
                            <option key={mt.id} value={mt.id}>{mt.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="form-label">Тип ліцензії</label>
                    <select
                        className="form-select"
                        name="licenceTypeId"
                        value={newMaterial.licenceTypeId}
                        onChange={handleChange}
                    >
                        <option value="">Оберіть тип ліцензії</option>
                        {data.licenceTypes.map(lt => (
                            <option key={lt.id} value={lt.id}>{lt.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="form-label">Обмеження використання</label>
                    <select
                        className="form-select"
                        name="usageRestrictionId"
                        value={newMaterial.usageRestrictionId}
                        onChange={handleChange}
                    >
                        <option value="">Без обмежень</option>
                        {data.usageRestrictions.map(ur => (
                            <option key={ur.id} value={ur.id}>{ur.description}</option>
                        ))}
                    </select>
                </div>

                <CreatableSelect
                    label="Цільова аудиторія"
                    name="targetAudienceId"
                    options={data.targetAudiences}
                    value={newMaterial.targetAudienceId}
                    onChange={(val) => setNewMaterial(prev => ({ ...prev, targetAudienceId: val }))}
                    createMutation={CREATE_TARGET_AUDIENCE} // Передаємо gql документ
                    refetchOptions={refetch}
                />

                <div className="mb-2">
                    <label className="form-label">Мова</label>
                    <select
                        className="form-select"
                        name="languageId"
                        value={newMaterial.languageId}
                        onChange={handleChange}
                    >
                        <option value="">Оберіть мову</option>
                        {data.languages.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-sm btn-primary mt-3">
                    💾 Додати
                </button>
            </form>
        </div>
    );
}
