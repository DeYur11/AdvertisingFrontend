import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import AddMaterialForm from "./AddMaterialForm";
import EditMaterialModal from "./EditMaterialModal";
import "./TaskDetails.css";
import MaterialDetails from "./MaterialDetails";



// --- GraphQL-запит на отримання матеріалів за завданням
const MATERIALS_BY_TASK = gql`
  query GetMaterialsByTask($taskId: ID!) {
    materialsByTask(taskId: $taskId) {
      id
      name
      description
      status { name }
      language { name }
    }
  }
`;

export default function TaskDetails({ data }) {
    const [activeTab, setActiveTab] = useState("info"); // 'info' | 'materials' | 'materialDetails'
    const [activeMaterial, setActiveMaterial] = useState(null);
    const [editingMaterial, setEditingMaterial] = useState(null);

    const { loading, error, data: materialsData, refetch } = useQuery(MATERIALS_BY_TASK, {
        variables: { taskId: data.id },
        fetchPolicy: "cache-and-network",
    });

    const materials = materialsData?.materialsByTask || [];

    const handleEditClick = (material, e) => {
        e.stopPropagation(); // щоб не клікати на перегляд
        setEditingMaterial(material);
    };

    const handleCloseModal = () => {
        setEditingMaterial(null);
    };

    const handleMaterialUpdated = () => {
        refetch();
        setEditingMaterial(null);
    };

    const handleViewMaterial = (material) => {
        setActiveMaterial(material);
        setActiveTab("materialDetails");
    };

    return (
        <div className="task-sidebar">
            {/* Вкладки */}
            <div className="tab-buttons mb-3" style={{ display: "flex", gap: "10px" }}>
                <button
                    onClick={() => setActiveTab("info")}
                    className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
                >
                    Інформація
                </button>
                <button
                    onClick={() => setActiveTab("materials")}
                    className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
                >
                    Матеріали
                </button>
                {activeTab === "materialDetails" && (
                    <button
                        onClick={() => setActiveTab("materials")}
                        className="tab-btn"
                    >
                        ⬅️ Назад
                    </button>
                )}
            </div>

            {/* Вкладка "Інформація" */}
            {activeTab === "info" && (
                <div className="info-tab">
                    <p><strong>Назва:</strong> {data.name}</p>
                    <p><strong>Опис:</strong> {data.description || "Немає опису"}</p>
                    <p><strong>Статус:</strong> {data.taskStatus?.name}</p>
                    <p><strong>Пріоритет:</strong> {data.priority}</p>
                    <p><strong>Вартість:</strong> {data.value}</p>
                    <p><strong>Дата старту:</strong> {data.startDate}</p>
                    <p><strong>Дедлайн:</strong> {data.deadline || "—"}</p>
                </div>
            )}

            {/* Вкладка "Матеріали" */}
            {activeTab === "materials" && (
                <div className="materials-tab">
                    <h6 className="mb-2">📎 Прикріплені матеріали</h6>

                    {loading && <p>Завантаження матеріалів...</p>}
                    {error && <p className="text-danger">Помилка при завантаженні матеріалів.</p>}

                    {!loading && !error && materials.length > 0 ? (
                        <ul className="list-group">
                            {materials.map((mat) => (
                                <li
                                    key={mat.id}
                                    className="list-group-item mb-3 border rounded p-2 material-item" // 👈 додаємо клас
                                    style={{cursor: "pointer"}}
                                    onClick={() => handleViewMaterial(mat)}
                                >
                                    <div><strong>Назва:</strong> {mat.name}</div>
                                    <div className="small text-secondary">
                                        Статус: <span>{mat.status?.name || "Невідомий"}</span> |
                                        Мова: <span>{mat.language?.name || "—"}</span>
                                    </div>

                                    {mat.status?.name !== "Accepted" && (
                                        <div className="mt-2 d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={(e) => handleEditClick(mat, e)}
                                            >
                                                📝 Редагувати
                                            </button>
                                            <button className="btn btn-sm btn-outline-warning">📤 На рецензію</button>
                                            <button className="btn btn-sm btn-outline-danger">🗑 Видалити</button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>

                    ) : (
                        !loading && !error && <p>Матеріалів поки немає.</p>
                    )}

                    <hr className="my-3"/>
                    <AddMaterialForm taskId={data.id} onAdded={refetch}/>
                </div>
            )}

            {/* Вкладка "Перегляд матеріалу" */}
            {activeTab === "materialDetails" && activeMaterial && (
                <MaterialDetails material={activeMaterial} onBack={() => setActiveTab("materials")}/>
            )}


            {/* Модальне вікно редагування матеріалу */}
            {editingMaterial && (
                <EditMaterialModal
                    materialId={editingMaterial.id}
                    onClose={handleCloseModal}
                    onUpdated={handleMaterialUpdated}
                />
            )}
        </div>
    );
}
