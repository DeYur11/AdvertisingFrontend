// src/pages/WorkerTasks/components/EditMaterialModal/EditMaterialModal.jsx
import { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import SelectWithCreate from "../../../../components/common/SelectWithCreate";
import CreatableSelect from "react-select/creatable";
import { executeMutation } from "../../../../utils/ErrorHandlingUtils";
import Button from "../../../../components/common/Button/Button";

// --- Queries & Mutations ---
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

const GET_MATERIAL_BY_ID = gql`
    query GetMaterial($id: ID!) {
        material(id: $id) {
            name
            description
            materialType { id }
            licenceType { id }
            usageRestriction { id }
            targetAudience { id }
            language { id }
            keywords { id name }
            status { id name }
        }
    }
`;

const UPDATE_MATERIAL = gql`
    mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {
        updateMaterial(id: $id, input: $input) {
            id
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

const CREATE_MUTATIONS = {
    typeId: gql`mutation($input: CreateMaterialTypeInput!) { createMaterialType(input: $input) { id name } }`,
    licenceTypeId: gql`mutation($input: CreateLicenceTypeInput!) { createLicenceType(input: $input) { id name } }`,
    usageRestrictionId: gql`mutation($input: CreateUsageRestrictionInput!) { createUsageRestriction(input: $input) { id description } }`,
    targetAudienceId: gql`mutation($input: CreateTargetAudienceInput!) { createTargetAudience(input: $input) { id name } }`,
    languageId: gql`mutation($input: CreateLanguageInput!) { createLanguage(input: $input) { id name } }`
};

export default function EditMaterialForm({ materialId, onUpdated, onClose }) {
    const {
        data: materialData,
        loading: loadingMaterial,
        error: errorMaterial
    } = useQuery(GET_MATERIAL_BY_ID, {
        variables: { id: materialId },
        skip: !materialId,
        fetchPolicy: "network-only"
    });

    const {
        data: refData,
        loading: loadingRef,
        error: errorRef,
        refetch
    } = useQuery(GET_MATERIAL_REFERENCE_DATA);

    const [updateMaterial, { loading: saving }] = useMutation(UPDATE_MATERIAL);
    const [createKeyword] = useMutation(CREATE_KEYWORD);

    const [form, setForm] = useState(null);
    const [isEditable, setIsEditable] = useState(true);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        if (materialData?.material) {
            const m = materialData.material;
            setForm({
                name: m.name || "",
                description: m.description || "",
                typeId: m.materialType?.id || "",
                licenceTypeId: m.licenceType?.id || "",
                usageRestrictionId: m.usageRestriction?.id || "",
                targetAudienceId: m.targetAudience?.id || "",
                languageId: m.language?.id || "",
                keywordIds: m.keywords?.map(k => k.id) || [],
            });

            // Перевірка статусу матеріалу
            const statusName = m.status?.name?.toLowerCase() || "";
            const isInReview = statusName === "під перевіркою" || statusName === "awaiting review" || statusName === "in review";
            const isAccepted = statusName === "accepted" || statusName === "прийнято";

            if (isInReview) {
                setIsEditable(false);
                setStatusMessage("Цей матеріал знаходиться на рецензуванні і не може бути відредагований. Дочекайтесь результатів рецензування або зверніться до рецензента.");
            } else if (isAccepted) {
                setIsEditable(false);
                setStatusMessage("Цей матеріал вже прийнято і не може бути відредагований. Створіть новий матеріал, якщо потрібно внести зміни.");
            } else {
                setIsEditable(true);
                setStatusMessage("");
            }
        }
    }, [materialData]);

    if (loadingMaterial) return <p>Завантаження матеріалу...</p>;
    if (errorMaterial) {
        console.error("Помилка при завантаженні матеріалу:", errorMaterial);
        return <p>❌ Помилка при завантаженні матеріалу: {errorMaterial.message}</p>;
    }

    if (!form) return null;

    if (loadingRef) return <p>Завантаження довідників...</p>;
    if (errorRef) {
        console.error("Помилка при завантаженні довідників:", errorRef);
        return <p>❌ Помилка при завантаженні довідників: {errorRef.message}</p>;
    }

    const handleChange = (e) => {
        if (!isEditable) return;
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleKeywordChange = async (selected) => {
        if (!isEditable) return;

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

        setForm(prev => ({ ...prev, keywordIds: newIds }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!isEditable) {
            return;
        }

        try {
            await executeMutation(updateMaterial, {
                variables: {
                    id: materialId,
                    input: {
                        name: form.name,
                        description: form.description,
                        typeId: parseInt(form.typeId),
                        usageRestrictionId: form.usageRestrictionId ? parseInt(form.usageRestrictionId) : null,
                        licenceTypeId: form.licenceTypeId ? parseInt(form.licenceTypeId) : null,
                        targetAudienceId: form.targetAudienceId ? parseInt(form.targetAudienceId) : null,
                        languageId: form.languageId ? parseInt(form.languageId) : null,
                        keywordIds: form.keywordIds.map(id => parseInt(id))
                    }
                },
                successMessage: "✅ Матеріал оновлено успішно!",
                errorMessage: "❌ Не вдалося оновити матеріал",
                onSuccess: onUpdated
            });
        } catch (err) {
            // executeMutation already handles the error display
            console.error("Error updating material:", err);
        }
    };

    const keywordOptions = refData.keywords.map(k => ({
        value: k.id,
        label: k.name,
    }));
    const selectedKeywords = keywordOptions.filter(opt => form.keywordIds.includes(opt.value));

    return (
        <div>
            <h6>✏️ Редагувати матеріал</h6>

            {!isEditable && (
                <div className="alert alert-warning" style={{
                    padding: '12px 16px',
                    background: '#fffbeb',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    color: '#92400e',
                    marginBottom: '16px'
                }}>
                    <strong>⚠️ Редагування заблоковано</strong>
                    <p style={{ margin: '8px 0 0' }}>{statusMessage}</p>
                </div>
            )}

            <form className="mt-2" onSubmit={handleUpdate}>
                <div className="mb-2">
                    <label className="form-label">Назва</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={!isEditable}
                    />
                </div>

                <div className="mb-2">
                    <label className="form-label">Опис</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="2"
                        disabled={!isEditable}
                    />
                </div>

                <SelectWithCreate
                    label="Тип матеріалу"
                    options={refData.materialTypes}
                    value={form.typeId}
                    onChange={(val) => {
                        if (isEditable) {
                            setForm(prev => ({ ...prev, typeId: val }));
                        }
                    }}
                    createMutation={CREATE_MUTATIONS.typeId}
                    refetchOptions={refetch}
                    disabled={!isEditable}
                />

                <SelectWithCreate
                    label="Тип ліцензії"
                    options={refData.licenceTypes}
                    value={form.licenceTypeId}
                    onChange={(val) => {
                        if (isEditable) {
                            setForm(prev => ({ ...prev, licenceTypeId: val }));
                        }
                    }}
                    createMutation={CREATE_MUTATIONS.licenceTypeId}
                    refetchOptions={refetch}
                    disabled={!isEditable}
                />

                <SelectWithCreate
                    label="Обмеження використання"
                    options={refData.usageRestrictions}
                    value={form.usageRestrictionId}
                    onChange={(val) => {
                        if (isEditable) {
                            setForm(prev => ({ ...prev, usageRestrictionId: val }));
                        }
                    }}
                    createMutation={CREATE_MUTATIONS.usageRestrictionId}
                    refetchOptions={refetch}
                    disabled={!isEditable}
                />

                <SelectWithCreate
                    label="Цільова аудиторія"
                    options={refData.targetAudiences}
                    value={form.targetAudienceId}
                    onChange={(val) => {
                        if (isEditable) {
                            setForm(prev => ({ ...prev, targetAudienceId: val }));
                        }
                    }}
                    createMutation={CREATE_MUTATIONS.targetAudienceId}
                    refetchOptions={refetch}
                    disabled={!isEditable}
                />

                <SelectWithCreate
                    label="Мова"
                    options={refData.languages}
                    value={form.languageId}
                    onChange={(val) => {
                        if (isEditable) {
                            setForm(prev => ({ ...prev, languageId: val }));
                        }
                    }}
                    createMutation={CREATE_MUTATIONS.languageId}
                    refetchOptions={refetch}
                    disabled={!isEditable}
                />

                <div className="mb-2">
                    <label className="form-label">Ключові слова</label>
                    <CreatableSelect
                        isMulti
                        onChange={handleKeywordChange}
                        onCreateOption={handleKeywordChange}
                        options={keywordOptions}
                        value={selectedKeywords}
                        isDisabled={!isEditable}
                    />
                </div>

                <div className="mt-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="outline"
                        size="medium"
                        onClick={onClose}
                    >
                        Скасувати
                    </Button>

                    {isEditable ? (
                        <Button
                            type="submit"
                            variant="primary"
                            size="medium"
                            disabled={saving}
                        >
                            {saving ? "Збереження..." : "💾 Зберегти зміни"}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={onClose}
                        >
                            Закрити
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}