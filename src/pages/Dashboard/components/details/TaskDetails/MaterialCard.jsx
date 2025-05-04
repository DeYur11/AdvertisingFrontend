import Card from "../../../../../components/common/Card/Card";
import Badge from "../../../../../components/common/Badge/Badge";
import Button from "../../../../../components/common/Button/Button";

export default function MaterialCard({ material, onEdit, onDelete, onClick, disabled }) {
    return (
        <Card className="material-card" onClick={onClick}>
            <div className="flex justify-between items-center">
                <strong>{material.name}</strong>
                <Badge variant={material.status?.name === "Accepted" ? "success" : "default"}>
                    {material.status?.name || "Unknown"}
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
                <div className="flex gap-2 mt-2">
                    <Button
                        variant="outline"
                        size="small"
                        icon="✏️"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(material.id);
                        }}
                    >
                        Edit
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
                        Delete
                    </Button>
                </div>
            )}
        </Card>
    );
}
