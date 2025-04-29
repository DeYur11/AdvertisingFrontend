import {
    Dialog, DialogTitle, DialogContent, CircularProgress,
    DialogActions, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

// --- GraphQL запити ---
const GET_MATERIAL_BY_ID = gql`
  query GetMaterialById($id: ID!) {
    material(id: $id) {
      id
      name
      description
      type { id }
      licenceType { id }
      usageRestriction { id }
      targetAudience { id }
      language { id }
    }
  }
`;

const GET_MATERIAL_REFERENCE_DATA = gql`
  query GetMaterialReferenceData {
    materialTypes { id name }
    licenceTypes { id name }
    usageRestrictions { id description }
    targetAudiences { id name }
    languages { id name }
  }
`;

const UPDATE_MATERIAL = gql`
  mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {
    updateMaterial(id: $id, input: $input) {
      id
      name
    }
  }
`;

export default function EditMaterialModal({ materialId, onClose, onUpdated }) {

    const { data: materialData, loading: loadingMaterial } = useQuery(GET_MATERIAL_BY_ID, {
        variables: { id: materialId },
        skip: !materialId,
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            console.log("✅ Дані прийшли на фронт:", data);
        },
    });

    const { data: refData, loading: loadingRefs } = useQuery(GET_MATERIAL_REFERENCE_DATA, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            console.log("✅ Дані прийшли на фронт:", data);
        },
    });

    const [updateMaterial, { loading: saving }] = useMutation(UPDATE_MATERIAL);

    const [form, setForm] = useState(null); // Форма буде створена тільки після завантаження даних

    useEffect(() => {
        console.log("✅ Оновлення");
        console.log(materialData)
        if (materialData?.material) {
            const m = materialData.material;
            setForm({
                name: m.name ?? "",
                description: m.description ?? "",
                typeId: m.type?.id ?? "",
                licenceTypeId: m.licenceType?.id ?? "",
                usageRestrictionId: m.usageRestriction?.id ?? "",
                targetAudienceId: m.targetAudience?.id ?? "",
                languageId: m.language?.id ?? "",
            });
        }
    }, [materialData, refData]);
    console.log(form, loadingMaterial, loadingRefs)
    if (!form || loadingMaterial || loadingRefs) {
        return (
            <Dialog open onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Редагування матеріалу</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                        <CircularProgress />
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await updateMaterial({
                variables: {
                    id: materialId,
                    input: {
                        name: form.name,
                        description: form.description,
                        typeId: parseInt(form.typeId),
                        licenceTypeId: form.licenceTypeId ? parseInt(form.licenceTypeId) : null,
                        usageRestrictionId: form.usageRestrictionId ? parseInt(form.usageRestrictionId) : null,
                        targetAudienceId: form.targetAudienceId ? parseInt(form.targetAudienceId) : null,
                        languageId: form.languageId ? parseInt(form.languageId) : null,
                    },
                },
            });
            if (onUpdated) onUpdated();
            onClose();
        } catch (error) {
            console.error("❌ Помилка збереження:", error.message);
        }
    };

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Редагування матеріалу</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="Назва"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="Опис"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <FormControl fullWidth required>
                        <InputLabel>Тип матеріалу</InputLabel>
                        <Select name="typeId" value={form.typeId} onChange={handleChange}>
                            {refData.materialTypes.map(t => (
                                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Тип ліцензії</InputLabel>
                        <Select name="licenceTypeId" value={form.licenceTypeId} onChange={handleChange}>
                            <MenuItem value="">—</MenuItem>
                            {refData.licenceTypes.map(lt => (
                                <MenuItem key={lt.id} value={lt.id}>{lt.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Обмеження використання</InputLabel>
                        <Select name="usageRestrictionId" value={form.usageRestrictionId} onChange={handleChange}>
                            <MenuItem value="">Без обмежень</MenuItem>
                            {refData.usageRestrictions.map(r => (
                                <MenuItem key={r.id} value={r.id}>{r.description}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Цільова аудиторія</InputLabel>
                        <Select name="targetAudienceId" value={form.targetAudienceId} onChange={handleChange}>
                            <MenuItem value="">—</MenuItem>
                            {refData.targetAudiences.map(a => (
                                <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Мова</InputLabel>
                        <Select name="languageId" value={form.languageId} onChange={handleChange}>
                            <MenuItem value="">—</MenuItem>
                            {refData.languages.map(l => (
                                <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Скасувати</Button>
                <Button onClick={handleSave} variant="contained" disabled={saving}>
                    {saving ? "Збереження..." : "Зберегти"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
