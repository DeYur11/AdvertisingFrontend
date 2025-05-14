import { useMutation, gql } from "@apollo/client";
import Card from "../../../../../components/common/Card/Card";
import Badge from "../../../../../components/common/Badge/Badge";
import Button from "../../../../../components/common/Button/Button";

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

    const handleSubmitForReview = async (e) => {
        e.stopPropagation();

        try {
            await updateMaterial({
                variables: {
                    id: material.id,
                    input: {
                        statusId: 2 // 🔁 замінити на справжній ID статусу "Очікує перевірки"
                    }
                }
            });

            if (onStatusChange) onStatusChange();
        } catch (err) {
            console.error("Не вдалося відправити на перевірку", err);
            alert("Сталася помилка під час відправки на перевірку.");
        }
    };

    return (
        <Card className="material-card" onClick={onClick}>
            <div className="flex justify-between items-center">
                <strong>{material.name}</strong>
                <Badge variant={material.status?.name === "Accepted" ? "success" : "default"}>
                    {material.status?.name || "Невідомо"}
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

                    {material.status?.name === "Draft" && (
                        <Button
                            variant="primary"
                            size="small"
                            icon="🚀"
                            onClick={handleSubmitForReview}
                        >
                            Надіслати на перевірку
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
}
