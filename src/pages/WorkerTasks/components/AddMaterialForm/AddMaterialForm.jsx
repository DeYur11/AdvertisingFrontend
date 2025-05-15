// src/pages/WorkerTasks/components/AddMaterialForm/AddMaterialForm.jsx
import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import SelectWithCreate from "../../../../components/common/SelectWithCreate";
import CreatableSelect from "react-select/creatable";
import { executeMutation } from "../../../../utils/ErrorHandlingUtils";

// --- Запит довідників ---
const GET_MATERIAL_REFERENCE_DATA = gql`
    query GetMaterialReferenceData {
        materialTypes { id name }
        licenceTypes { id name }
        usageRestrictions { id name }
        targetAudiences { id name }
        languages { id name }
        keywords { id name }
    }
`;

// --- Мутації для створення варіантів ---
const CREATE_MATERIAL_TYPE = gql`
    mutation($input: CreateMaterialTypeInput!) {
        createMaterialType(input: $input) {
            id
            name
        }
    }
`;

const CREATE_LICENCE_TYPE = gql`
    mutation($input: CreateLicenceTypeInput!) {
        createLicenceType(input: $input) {
            id
            name
        }
    }
`;

const CREATE_USAGE_RESTRICTION = gql`
    mutation($input: CreateUsageRestrictionInput!) {
        createUsageRestriction(input: $input) {
            id
            description
        }
    }
`;

const CREATE_TARGET_AUDIENCE = gql`
    mutation($input: CreateTargetAudienceInput!) {
        createTargetAudience(input: $input) {
            id
            name
        }
    }
`;

const CREATE_LANGUAGE = gql`
    mutation($input: CreateLanguageInput!) {
        createLanguage(input: $input) {
            id
            name
        }
    }
`;

const CREATE_KEYWORD = gql`
    mutation($input: CreateKeywordInput!) {
        createKeyword(input: $input) {
            id
            name
        }
    }
`;

// --- Мутація створення матеріалу ---
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
        materialTypeId: "",
        usageRestrictionId: "",
        licenceTypeId: "",
        targetAudienceId: "",
        languageId: "",
        keywordIds: []
    });

    const { loading, error, data, refetch } = useQuery(GET_MATERIAL_REFERENCE_DATA);
    const [createMaterial] = useMutation(CREATE_MATERIAL);
    const [createKeyword] = useMutation(CREATE_KEYWORD);

    if (loading) return <p>Завантаження довідників...</p>;
    if (error) return <p>Помилка при завантаженні: {error.message}</p>;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewMaterial((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();

        try {
            await executeMutation(createMaterial, {
                variables: {
                    input: {
                        ...newMaterial,
                        materialTypeId: parseInt(newMaterial.materialTypeId),
                        usageRestrictionId: newMaterial.usageRestrictionId ? parseInt(newMaterial.usageRestrictionId) : null,
                        licenceTypeId: newMaterial.licenceTypeId ? parseInt(newMaterial.licenceTypeId) : null,
                        targetAudienceId: newMaterial.targetAudienceId ? parseInt(newMaterial.targetAudienceId) : null,
                        languageId: newMaterial.languageId ? parseInt(newMaterial.languageId) : null,
                        keywordIds: newMaterial.keywordIds.map((id) => parseInt(id)),
                        taskId: parseInt(taskId),
                    },
                },
                successMessage: "✅ Матеріал успішно створено!",
                errorMessage: "❌ Не вдалося створити матеріал",
                onSuccess: () => {
                    setNewMaterial({
                        name: "",
                        description: "",
                        materialTypeId: "",
                        usageRestrictionId: "",
                        licenceTypeId: "",
                        targetAudienceId: "",
                        languageId: "",
                        keywordIds: []
                    });

                    if (onAdded) onAdded();
                }
            });
        } catch (err) {
            // executeMutation already handles the error display
            console.error("Error creating material:", err);
        }
    };

    const keywordOptions = data.keywords.map((kw) => ({ value: kw.id, label: kw.name }));

    const handleKeywordChange = async (selected) => {
        const existing = selected.filter(opt => !opt.__isNew__);
        const toCreate = selected.filter(opt => opt.__isNew__);

        const newIds = [...existing.map(k => k.value)];

        for (const kw of toCreate) {
            try {
                const result = await executeMutation(createKeyword, {
                    variables: { input: { name: kw.label } },
                    successMessage: `Ключове слово "${kw.label}" створено`,
                    showSuccessToast: false // Don't show for each keyword to avoid spam
                });

                if (result?.data?.createKeyword?.id) {
                    newIds.push(result.data.createKeyword.id);
                }
            } catch (err) {
                // executeMutation already handles the error display
                console.error("Error creating keyword:", err);
            }
        }

        setNewMaterial((prev) => ({ ...prev, keywordIds: newIds }));
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

                <SelectWithCreate label="Тип матеріалу" options={data.materialTypes} value={newMaterial.materialTypeId} onChange={(val) => setNewMaterial((prev) => ({ ...prev, materialTypeId: val }))} createMutation={CREATE_MATERIAL_TYPE} refetchOptions={refetch} />

                <SelectWithCreate label="Тип ліцензії" options={data.licenceTypes} value={newMaterial.licenceTypeId} onChange={(val) => setNewMaterial((prev) => ({ ...prev, licenceTypeId: val }))} createMutation={CREATE_LICENCE_TYPE} refetchOptions={refetch} />

                <SelectWithCreate label="Обмеження використання" options={data.usageRestrictions} value={newMaterial.usageRestrictionId} onChange={(val) => setNewMaterial((prev) => ({ ...prev, usageRestrictionId: val }))} createMutation={CREATE_USAGE_RESTRICTION} refetchOptions={refetch} />

                <SelectWithCreate label="Цільова аудиторія" options={data.targetAudiences} value={newMaterial.targetAudienceId} onChange={(val) => setNewMaterial((prev) => ({ ...prev, targetAudienceId: val }))} createMutation={CREATE_TARGET_AUDIENCE} refetchOptions={refetch} />

                <SelectWithCreate label="Мова" options={data.languages} value={newMaterial.languageId} onChange={(val) => setNewMaterial((prev) => ({ ...prev, languageId: val }))} createMutation={CREATE_LANGUAGE} refetchOptions={refetch} />

                <div className="mb-2">
                    <label className="form-label">Ключові слова</label>
                    <CreatableSelect
                        isMulti
                        placeholder="Оберіть або створіть ключові слова"
                        onChange={handleKeywordChange}
                        options={keywordOptions}
                    />
                </div>

                <button type="submit" className="btn btn-sm btn-primary mt-3">
                    💾 Додати
                </button>
            </form>
        </div>
    );
}