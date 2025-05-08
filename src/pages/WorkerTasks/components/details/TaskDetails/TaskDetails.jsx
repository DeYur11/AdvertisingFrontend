import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { MATERIALS_BY_TASK, DELETE_MATERIAL } from "../../../graphql/queries";

import TaskTabs from "./TaskTabs";
import TaskInfoTab from "./TaskInfoTab";
import TaskMaterialsTab from "./TaskMaterialsTab";
import Modal from "../../../../../components/common/Modal/Modal";
import ConfirmationDialog from "../../../../../components/common/ConfirmationDialog/ConfirmationDialog";

import MaterialDetails from "../../MaterialDetails/MaterialDetails";
import AddMaterialForm from "../../AddMaterialForm/AddMaterialForm";
import EditMaterialModal from "../../EditMaterialModal/EditMaterialModal";

export default function TaskDetails({ data }) {
    const [activeTab, setActiveTab] = useState("info");
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    const isTaskCompleted = data.taskStatus?.name?.toLowerCase() === "completed";

    const { loading, error, data: materialsData, refetch } = useQuery(MATERIALS_BY_TASK, {
        variables: { taskId: data.id },
        fetchPolicy: "network-only",
    });

    const [deleteMaterial] = useMutation(DELETE_MATERIAL, {
        onCompleted: refetch,
    });

    const materials = materialsData?.materialsByTask || [];

    const handleDelete = (id) => setDeleteConfirmation(id);
    const confirmDelete = async () => {
        await deleteMaterial({ variables: { id: deleteConfirmation } });
        setDeleteConfirmation(null);
    };

    return (
        <div>
            <TaskTabs activeTab={activeTab} setActiveTab={setActiveTab} materialsCount={materials.length} loading={loading} />

            {activeTab === "info" && <TaskInfoTab data={data} />}
            {activeTab === "materials" && (
                <TaskMaterialsTab
                    materials={materials}
                    loading={loading}
                    error={error}
                    isTaskCompleted={isTaskCompleted}
                    onAdd={() => setShowAddMaterial(true)}
                    onEdit={setEditingMaterial}
                    onDelete={handleDelete}
                    onSelect={setSelectedMaterial}
                />
            )}

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

            <Modal
                isOpen={showAddMaterial}
                onClose={() => setShowAddMaterial(false)}
                title="Add Material"
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

            <Modal
                isOpen={!!editingMaterial}
                onClose={() => setEditingMaterial(null)}
                title="Edit Material"
                size="large"
            >
                <EditMaterialModal
                    materialId={editingMaterial}
                    onClose={() => setEditingMaterial(null)}
                    onUpdated={() => {
                        setEditingMaterial(null);
                        refetch();
                    }}
                />
            </Modal>

            <ConfirmationDialog
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={confirmDelete}
                title="Delete Material"
                message="Are you sure you want to delete this material? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
