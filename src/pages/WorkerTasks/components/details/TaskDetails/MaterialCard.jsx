// src/pages/WorkerTasks/components/details/TaskDetails/MaterialCard.jsx
import { useMutation, gql } from "@apollo/client";
import Card from "../../../../../components/common/Card/Card";
import Badge from "../../../../../components/common/Badge/Badge";
import Button from "../../../../../components/common/Button/Button";
import { executeMutation } from "../../../../../utils/ErrorHandlingUtils";

const UPDATE_MATERIAL = gql`
    mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {
        updateMaterial(id: $id, input: $input) {
            id
            status {
                id
                name
            }
        }
    }
`;

export default function MaterialCard({ material, onEdit, onDelete, onClick, disabled, onStatusChange }) {
    const [updateMaterial] = useMutation(UPDATE_MATERIAL);

    // Перевірка чи може користувач редагувати матеріал на основі його статусу
    const statusName = material.status?.name?.toLowerCase() || "";
    const isEditable = statusName === "draft" || statusName === "";
    const isInReview = statusName === "під перевіркою" || statusName === "awaiting review" || statusName === "in review";
    const isAccepted = statusName === "accepted" || statusName === "прийнято";

    // Отримання варіанту бейджу на основі статусу
    const getBadgeVariant = () => {
        if (isAccepted) return "success";
        if (isInReview) return "warning";
        return "default";
    };

    const handleSubmitForReview = async (e) => {
        e.stopPropagation();

        try {
            await executeMutation(updateMaterial, {
                variables: {
                    id: material.id,
                    input: {
                        statusId: 2 // ID статусу "Очікує перевірки"
                    }
                },
                successMessage: "Матеріал відправлено на перевірку",
                errorMessage: "Не вдалося відправити матеріал на перевірку",
                onSuccess: () => {
                    if (onStatusChange) onStatusChange();
                }
            });
        } catch (err) {
            // executeMutation already handles the error display
            console.error("Error in handleSubmitForReview:", err);
        }
    };

    return (
        <Card className="material-card" onClick={onClick}>
            <div className="flex justify-between items-center">
                <strong>{material.name}</strong>
                <Badge variant={getBadgeVariant()}>
                    {material.status?.name || "Чернетка"}
                </Badge>
            </div>

            {material.description && <p>{material.description}</p>}

            <div className="flex gap-1 mt-2 flex-wrap">
                {material.language?.name && (
                    <Badge variant="default" size="small">{material.language.name}</Badge>
                )}
                {(material.keywords || []).slice(0, 3).map(k => (
                    <Badge key={k.name} size="small">#{k.name}</Badge>
                ))}
            </div>

            {!disabled && (
                <div className="flex gap-2 mt-2 flex-wrap">
                    {isEditable && (
                        <>
                            <Button
                                variant="outline"
                                size="small"
                                icon="✏️"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(material.id);
                                }}
                            >
                                Редагувати
                            </Button>
                            <Button
                                variant="danger"
                                size="small"
                                icon="🗑"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(material.id);
                                }}
                            >
                                Видалити
                            </Button>
                        </>
                    )}

                    {isEditable && (
                        <Button
                            variant="primary"
                            size="small"
                            icon="🚀"
                            onClick={handleSubmitForReview}
                        >
                            Надіслати на перевірку
                        </Button>
                    )}

                    {isInReview && (
                        <Button
                            variant="outline"
                            size="small"
                            icon="⏳"
                            disabled={true}
                        >
                            Очікує перевірки
                        </Button>
                    )}

                    {isAccepted && (
                        <Button
                            variant="success"
                            size="small"
                            icon="✅"
                            disabled={true}
                        >
                            Прийнято
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
}