import Modal from "../../../../../components/common/Modal/Modal";
import Card from "../../../../../components/common/Card/Card";
import InfoRow from "../../../../../components/common/InfoRow/InfoRow";
import ServiceDetails from "../ServiceDetails/ServiceDetails";
import TaskDetails from "../TaskDetails/TaskDetails";

export default function TaskDetailsModal({ isOpen, onClose, selectedItem, activeProject, activeService }) {
    if (!selectedItem) return null;

    const { type, data } = selectedItem;
    const title = type === "service" ? `Сервіс: ${data.serviceName}` : `Завдання: ${data.name}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="large">
            {(activeProject || (activeService && type === "task")) && (
                <Card variant="subtle" className="mb-3">
                    {activeProject && (
                        <InfoRow label="Проєкт:" value={activeProject.name} />
                    )}
                    {activeService && type === "task" && (
                        <InfoRow label="Сервіс:" value={activeService.serviceName} />
                    )}
                </Card>
            )}

            {type === "service" && <ServiceDetails data={data} />}
            {type === "task" && <TaskDetails data={data} />}
        </Modal>
    );
}
