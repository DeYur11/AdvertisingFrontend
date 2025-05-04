import Card from "../../../../../components/common/Card/Card";
import Button from "../../../../../components/common/Button/Button";
import MaterialCard from "./MaterialCard";

export default function TaskMaterialsTab({
                                             materials,
                                             loading,
                                             error,
                                             isTaskCompleted,
                                             onAdd,
                                             onEdit,
                                             onDelete,
                                             onSelect
                                         }) {
    if (loading) return <div>Loading…</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3>Attached Materials</h3>
                {!isTaskCompleted && (
                    <Button variant="primary" size="small" icon="+" onClick={onAdd}>
                        Add Material
                    </Button>
                )}
            </div>

            {materials.length === 0 ? (
                <Card className="text-center">
                    <p>No materials attached yet.</p>
                    {!isTaskCompleted && (
                        <Button variant="primary" onClick={onAdd}>
                            Add First Material
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid gap-2">
                    {materials.map((m) => (
                        <MaterialCard
                            key={m.id}
                            material={m}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onClick={() => onSelect(m)}
                            disabled={isTaskCompleted}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
