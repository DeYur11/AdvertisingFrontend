import { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import SelectWithCreate from "../../../../components/common/SelectWithCreate";
import CreatableSelect from "react-select/creatable";

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

export default function EditMaterialForm({ materialId, onUpdated }) {
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
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleKeywordChange = async (selected) => {
        const existing = selected.filter(opt => !opt.__isNew__);
        const toCreate = selected.filter(opt => opt.__isNew__);
        const newIds = [...existing.map(k => k.value)];

        for (const kw of toCreate) {
            try {
                const { data } = await createKeyword({ variables: { input: { name: kw.label } } });
                if (data?.createKeyword?.id) newIds.push(data.createKeyword.id);
            } catch (err) {
                console.error("Помилка при створенні ключового слова:", err);
            }
        }

        setForm(prev => ({ ...prev, keywordIds: newIds }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateMaterial({
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
                }
            });
            alert("✅ Матеріал оновлено успішно!");
            onUpdated?.();
        } catch (err) {
            console.error("❌ Оновлення не вдалося:", err);
            alert("❌ Не вдалося оновити матеріал: " + err.message);
        }
    };

    const keywordOptions = refData.keywords.map(k => ({ value: k.id, label: k.name }));
    const selectedKeywords = keywordOptions.filter(opt => form.keywordIds.includes(opt.value));

    return (
        <div>
            <h6>✏️ Редагувати матеріал</h6>
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
                    />
                </div>

                <SelectWithCreate
                    label="Тип матеріалу"
                    options={refData.materialTypes}
                    value={form.typeId}
                    onChange={(val) => setForm(prev => ({ ...prev, typeId: val }))}
                    createMutation={CREATE_MUTATIONS.typeId}
                    refetchOptions={refetch}
                />

                <SelectWithCreate
                    label="Тип ліцензії"
                    options={refData.licenceTypes}
                    value={form.licenceTypeId}
                    onChange={(val) => setForm(prev => ({ ...prev, licenceTypeId: val }))}
                    createMutation={CREATE_MUTATIONS.licenceTypeId}
                    refetchOptions={refetch}
                />

                <SelectWithCreate
                    label="Обмеження використання"
                    options={refData.usageRestrictions}
                    value={form.usageRestrictionId}
                    onChange={(val) => setForm(prev => ({ ...prev, usageRestrictionId: val }))}
                    createMutation={CREATE_MUTATIONS.usageRestrictionId}
                    refetchOptions={refetch}
                />

                <SelectWithCreate
                    label="Цільова аудиторія"
                    options={refData.targetAudiences}
                    value={form.targetAudienceId}
                    onChange={(val) => setForm(prev => ({ ...prev, targetAudienceId: val }))}
                    createMutation={CREATE_MUTATIONS.targetAudienceId}
                    refetchOptions={refetch}
                />

                <SelectWithCreate
                    label="Мова"
                    options={refData.languages}
                    value={form.languageId}
                    onChange={(val) => setForm(prev => ({ ...prev, languageId: val }))}
                    createMutation={CREATE_MUTATIONS.languageId}
                    refetchOptions={refetch}
                />

                <div className="mb-2">
                    <label className="form-label">Ключові слова</label>
                    <CreatableSelect
                        isMulti
                        value={selectedKeywords}
                        placeholder="Оберіть або створіть ключові слова"
                        onChange={handleKeywordChange}
                        options={keywordOptions}
                    />
                </div>

                <button type="submit" className="btn btn-sm btn-primary mt-3" disabled={saving}>
                    {saving ? "Збереження..." : "💾 Зберегти зміни"}
                </button>
            </form>
        </div>
    );
}
