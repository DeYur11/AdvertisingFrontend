import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Badge from "../../../../../components/common/Badge/Badge";
import Button from "../../../../../components/common/Button/Button";
import Card from "../../../../../components/common/Card/Card";
import Modal from "../../../../../components/common/Modal/Modal";
import { MATERIALS_BY_TASK, DELETE_MATERIAL } from "../../../../tasks/graphql/queries";
import MaterialDetails from "../../../../materials/components/MaterialDetails/MaterialDetails";
import AddMaterialForm from "../../../../materials/components/AddMaterialForm/AddMaterialForm";
import EditMaterialModal from "../../../../materials/components/EditMaterialModal/EditMaterialModal";
import "./TaskDetails.css";

export default function TaskDetails({ data }) {
    const [activeTab, setActiveTab] = useState("info");
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    // Check if task is completed to prevent CRUD operations
    const isTaskCompleted = data.taskStatus?.name?.toLowerCase() === "completed";

    // Fetch materials for the task
    const { loading, error, data: materialsData, refetch } = useQuery(MATERIALS_BY_TASK, {
        variables: { taskId: data.id },
        fetchPolicy: "network-only",
    });

    // Delete material mutation
    const [deleteMaterial] = useMutation(DELETE_MATERIAL, {
        onCompleted: () => {
            refetch();
        },
    });

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    const handleDeleteMaterial = (materialId) => {
        setDeleteConfirmation(materialId);
    };

    const confirmDelete = async () => {
        try {
            await deleteMaterial({
                variables: { id: deleteConfirmation }
            });
            setDeleteConfirmation(null);
        } catch (error) {
            console.error("Error deleting material:", error);
            // We'll show the error in the UI instead of using alert
            setDeleteConfirmation(null);
        }
    };

    // Determine status class
    const statusClass = data.taskStatus?.name?.toLowerCase() || "";

    // Determine priority display and class
    let priorityClass = "default";

    if (data.priority) {
        const priority = parseInt(data.priority);

        if (priority >= 8) {
            priorityClass = "priority-high";
        } else if (priority >= 4) {
            priorityClass = "priority-medium";
        } else {
            priorityClass = "priority-low";
        }
    }

    const materials = materialsData?.materialsByTask || [];

    return (
        <div className="task-details">
            {/* Tabs */}
            <div className="task-tabs">
                <Button
                    variant={activeTab === "info" ? "primary" : "outline"}
                    size="small"
                    onClick={() => setActiveTab("info")}
                    className="tab-button"
                >
                    Information
                </Button>
                <Button
                    variant={activeTab === "materials" ? "primary" : "outline"}
                    size="small"
                    onClick={() => setActiveTab("materials")}
                    className="tab-button"
                >
                    Materials ({loading ? "..." : materials.length})
                </Button>
            </div>

            {/* Information tab */}
            {activeTab === "info" && (
                <div className="info-tab">
                    <Card className="info-card">
                        <div className="task-title-section">
                            <h2 className="task-name">{data.name}</h2>
                            <Badge
                                className={`status-badge status-${statusClass}`}
                                variant={
                                    statusClass === "completed" ? "success" :
                                        statusClass === "in progress" ? "primary" :
                                            statusClass === "pending" ? "danger" :
                                                "default"
                                }
                                size="medium"
                            >
                                {data.taskStatus?.name || "Unknown"}
                            </Badge>
                        </div>

                        {data.description && (
                            <div className="task-description">
                                <h3 className="section-title">Description</h3>
                                <div className="description-content">{data.description || "No description provided."}</div>
                            </div>
                        )}

                        <div className="task-details-grid">
                            <div className="details-col">
                                <h3 className="section-title">Task Details</h3>

                                <div className="detail-item">
                                    <div className="detail-label">Priority</div>
                                    <div className="detail-value">
                                        <Badge className={priorityClass}>
                                            {data.priority || "—"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">Value</div>
                                    <div className="detail-value cost">
                                        {data.value ? `$${data.value}` : "—"}
                                    </div>
                                </div>
                            </div>

                            <div className="details-col">
                                <h3 className="section-title">Dates</h3>

                                <div className="detail-item">
                                    <div className="detail-label">Start Date</div>
                                    <div className="detail-value">
                                        {formatDate(data.startDate)}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">Deadline</div>
                                    <div className="detail-value deadline">
                                        {formatDate(data.deadline)}
                                    </div>
                                </div>

                                {data.endDate && (
                                    <div className="detail-item">
                                        <div className="detail-label">End Date</div>
                                        <div className="detail-value">
                                            {formatDate(data.endDate)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Materials tab */}
            {activeTab === "materials" && (
                <div className="materials-tab">
                    <div className="materials-header">
                        <h3 className="section-title">Attached Materials</h3>
                        {!isTaskCompleted && (
                            <Button
                                variant="primary"
                                size="small"
                                icon="+"
                                className="add-material-btn"
                                onClick={() => setShowAddMaterial(true)}
                            >
                                Add Material
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="loading-materials">Loading materials...</div>
                    ) : error ? (
                        <div className="error-message">Error loading materials: {error.message}</div>
                    ) : materials.length > 0 ? (
                        <div className="materials-grid">
                            {materials.map((material) => (
                                <Card
                                    key={material.id}
                                    className="material-card"
                                    hoverable
                                    onClick={() => setSelectedMaterial(material)}
                                >
                                    <div className="material-header">
                                        <div className="material-name">{material.name}</div>
                                        <div className="material-status">
                                            <Badge
                                                variant={
                                                    material.status?.name === "Accepted" ? "success" :
                                                        "default"
                                                }
                                                size="small"
                                            >
                                                {material.status?.name || "Unknown"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {material.description && (
                                        <div className="material-description">
                                            {material.description.length > 100
                                                ? `${material.description.substring(0, 100)}...`
                                                : material.description
                                            }
                                        </div>
                                    )}

                                    <div className="material-meta">
                                        {material.language?.name && (
                                            <Badge className="language-badge" size="small">
                                                {material.language.name}
                                            </Badge>
                                        )}

                                        {material.keywords && material.keywords.length > 0 && (
                                            <div className="keywords">
                                                {material.keywords.slice(0, 3).map(kw => (
                                                    <span key={kw.name} className="keyword">
                                                        #{kw.name}
                                                    </span>
                                                ))}
                                                {material.keywords.length > 3 && (
                                                    <span className="more-keywords">
                                                        +{material.keywords.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {!isTaskCompleted && (
                                        <div className="material-actions">
                                            <Button
                                                variant="outline"
                                                size="small"
                                                icon="✏️"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingMaterial(material.id);
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
                                                    handleDeleteMaterial(material.id);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="empty-state-card">
                            <div className="no-materials">
                                <div className="empty-icon">📄</div>
                                <div className="empty-message">No materials attached to this task yet</div>
                                {!isTaskCompleted && (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowAddMaterial(true)}
                                    >
                                        Add First Material
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Material details modal */}
            <Modal
                isOpen={!!selectedMaterial}
                onClose={() => setSelectedMaterial(null)}
                title="Material Details"
                size="medium"
            >
                {selectedMaterial && (
                    <MaterialDetails
                        material={selectedMaterial}
                        onBack={() => setSelectedMaterial(null)}
                    />
                )}
            </Modal>

            {/* Add material modal */}
            <Modal
                isOpen={showAddMaterial}
                onClose={() => setShowAddMaterial(false)}
                title="Add New Material"
                size="large"
            >
                <AddMaterialForm
                    taskId={data.id}
                    onAdded={() => {
                        setShowAddMaterial(false);
                        refetch();
                    }}
                />
            </Modal>

            {/* Edit material modal */}
            {editingMaterial && (
                <EditMaterialModal
                    materialId={editingMaterial}
                    onClose={() => setEditingMaterial(null)}
                    onUpdated={() => {
                        setEditingMaterial(null);
                        refetch();
                    }}
                />
            )}

            {/* Delete confirmation modal */}
            <Modal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                title="Confirm Deletion"
                size="small"
            >
                <div className="delete-confirmation">
                    <p>Are you sure you want to delete this material?</p>
                    <p>This action cannot be undone.</p>

                    <div className="confirmation-actions">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmation(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}