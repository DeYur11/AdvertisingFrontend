// src/pages/ServiceTracker/components/CreateServiceModal/CreateServiceModal.jsx
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import TaskList from "../TaskList/TaskList";
import TaskForm from "../TaskForm/TaskForm";
import ServiceForm from "../ServiceForm/ServiceForm";
import { GET_WORKERS } from "../../graphql/queries";
import {
    CREATE_SERVICE_IN_PROGRESS,
    CREATE_TASK
} from "../../graphql/mutations";
import { getWorkerNameById } from "../../utils/serviceUtils";
import "./CreateServiceModal.css";

export default function CreateServiceModal({
                                               isOpen,
                                               onClose,
                                               onSave,
                                               projectService
                                           }) {
    // Стан форми сервісу (без статусу)
    const [serviceForm, setServiceForm] = useState({
        startDate: new Date().toISOString().split("T")[0],
        cost: projectService?.service?.estimateCost || ""
    });

    // Стан задач
    const [tasks, setTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [editingTaskIndex, setEditingTaskIndex] = useState(-1);

    // Довідники
    const { data: workersData } = useQuery(GET_WORKERS);
    const workers = workersData?.workers || [];

    // Мутації
    const [createServiceInProgress] = useMutation(CREATE_SERVICE_IN_PROGRESS);
    const [createTask] = useMutation(CREATE_TASK);

    // Зміни у формі сервісу
    const handleServiceFormChange = (newData) => {
        setServiceForm(newData);
    };

    // Зберегти / відредагувати задачу
    const handleTaskSave = (taskData, editIndex) => {
        const taskWithWorkerName = {
            ...taskData,
            assignedWorkerName: getWorkerNameById(taskData.assignedWorkerId, workers)
        };

        if (editIndex >= 0) {
            const updatedTasks = [...tasks];
            updatedTasks[editIndex] = taskWithWorkerName;
            setTasks(updatedTasks);
        } else {
            setTasks(prev => [...prev, taskWithWorkerName]);
        }
        setShowTaskModal(false);
    };

    // Додати задачу
    const handleAddTask = () => {
        setCurrentTask({
            name: "",
            description: "",
            deadline: new Date().toISOString().split("T")[0],
            assignedWorkerId: "",
            priority: "5",
            value: ""
        });
        setEditingTaskIndex(-1);
        setShowTaskModal(true);
    };

    // Редагувати задачу
    const handleEditTask = (index) => {
        setCurrentTask({ ...tasks[index] });
        setEditingTaskIndex(index);
        setShowTaskModal(true);
    };

    // Видалити задачу
    const handleRemoveTask = (index) => {
        setTasks(prev => prev.filter((_, i) => i !== index));
    };

    // Submit усієї форми
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Створюємо ServiceInProgress (без статусу)
            const { data: sipData } = await createServiceInProgress({
                variables: {
                    input: {
                        projectServiceId: parseInt(projectService.id),
                        startDate: serviceForm.startDate,
                        cost: serviceForm.cost ? parseFloat(serviceForm.cost) : null
                    }
                }
            });

            const newServiceInProgressId = sipData.createServiceInProgress.id;

            // Створюємо задачі (якщо є)
            for (const task of tasks) {
                if (task.name && task.deadline && task.assignedWorkerId) {
                    await createTask({
                        variables: {
                            input: {
                                name: task.name,
                                description: task.description || null,
                                deadline: task.deadline,
                                serviceInProgressId: newServiceInProgressId,
                                assignedWorkerId: parseInt(task.assignedWorkerId),
                                priority: task.priority ? parseInt(task.priority) : null,
                                value: task.value ? parseFloat(task.value) : null
                            }
                        }
                    });
                }
            }

            onSave();
        } catch (err) {
            console.error("Error creating service in progress:", err);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Створення реалізації сервісу з задачами"
            size="large"
        >
            <form onSubmit={handleSubmit} className="service-form">
                {/* Деталі сервісу */}
                <ServiceForm
                    serviceForm={serviceForm}
                    onChange={handleServiceFormChange}
                    projectService={projectService}
                />

                {/* Блок задач */}
                <TaskList
                    tasks={tasks}
                    onEdit={handleEditTask}
                    onRemove={handleRemoveTask}
                    onAddNewTask={handleAddTask}
                />

                <div className="form-actions">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Скасувати
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!serviceForm.startDate}
                    >
                        Створити реалізацію сервісу
                    </Button>
                </div>
            </form>

            {/* Модалка задачі */}
            {showTaskModal && (
                <TaskForm
                    isOpen={showTaskModal}
                    onClose={() => setShowTaskModal(false)}
                    onSave={handleTaskSave}
                    task={currentTask}
                    workers={workers}
                    editIndex={editingTaskIndex}
                />
            )}
        </Modal>
    );
}
