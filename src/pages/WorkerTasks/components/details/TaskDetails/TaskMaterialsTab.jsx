import Card from "../../../../../components/common/Card/Card";
import Button from "../../../../../components/common/Button/Button";
import MaterialCard from "./MaterialCard";

export default function TaskMaterialsTab({
                                             materials,
                                             loading,
                                             error,
                                             isTaskCompleted,
                                             isTaskInProgress,
                                             onAdd,
                                             onEdit,
                                             onDelete,
                                             onSelect
                                         }) {
    if (loading) return <div>Завантаження…</div>;
    if (error) return <div>Помилка: {error.message}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3>Прикріплені матеріали</h3>
                {isTaskInProgress && !isTaskCompleted && (
                    <Button variant="primary" size="small" icon="+" onClick={onAdd}>
                        Додати матеріал
                    </Button>
                )}
            </div>

            {materials.length === 0 ? (
                <Card className="text-center">
                    <p>Матеріали ще не прикріплені.</p>
                    {isTaskInProgress && !isTaskCompleted && (
                        <Button variant="primary" onClick={onAdd}>
                            Додати перший матеріал
                        </Button>
                    )}
                    {!isTaskInProgress && !isTaskCompleted && (
                        <p className="text-orange-500 mt-2">
                            ⚠️ Завдання ще не розпочате. Ви зможете додавати матеріали після початку виконання завдання.
                        </p>
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
                            disabled={!isTaskInProgress || isTaskCompleted}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}