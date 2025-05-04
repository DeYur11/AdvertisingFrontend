// src/pages/ServiceTracker/components/CreateServiceModal/CreateServiceModal.jsx
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import TaskList from "../TaskList/TaskList";
import TaskForm from "../TaskForm/TaskForm";
import ServiceForm from "../ServiceForm/ServiceForm";
import {
    GET_SERVICE_STATUSES,
    GET_WORKERS
} from "../../graphql/queries";
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
    // Form state with the correct field names
    const [serviceForm, setServiceForm] = useState({
        assignedWorkerId: "",
        serviceInProgressStatusId: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        cost: projectService?.service?.estimateCost || ""
    });

    // Tasks state
    const [tasks, setTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [editingTaskIndex, setEditingTaskIndex] = useState(-1);

    // Fetching reference data
    const { data: statusesData } = useQuery(GET_SERVICE_STATUSES);
    const { data: workersData } = useQuery(GET_WORKERS);

    // Mutations
    const [createServiceInProgress] = useMutation(CREATE_SERVICE_IN_PROGRESS);
    const [createTask] = useMutation(CREATE_TASK);

    // Get statuses and workers
    const statuses = statusesData?.serviceInProgressStatuses || [];
    const workers = workersData?.workers || [];

    // Handle service form field changes
    const handleServiceFormChange = (newData) => {
        setServiceForm(newData);
    };

    // Handle task save
    const handleTaskSave = (taskData, editIndex) => {
        // Add worker name for display purposes
        const taskWithWorkerName = {
            ...taskData,
            assignedWorkerName: getWorkerNameById(taskData.assignedWorkerId, workers)
        };

        if (editIndex >= 0) {
            // Edit existing task
            const updatedTasks = [...tasks];
            updatedTasks[editIndex] = taskWithWorkerName;
            setTasks(updatedTasks);
        } else {
            // Add new task
            setTasks(prev => [...prev, taskWithWorkerName]);
        }
        setShowTaskModal(false);
    };

    // Open task form for adding a new task
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

    // Open task form for editing an existing task
    const handleEditTask = (index) => {
        setCurrentTask({...tasks[index]});
        setEditingTaskIndex(index);
        setShowTaskModal(true);
    };

    // Remove a task from the list
    const handleRemoveTask = (index) => {
        setTasks(prev => prev.filter((_, i) => i !== index));
    };

    // Handle submit of the entire form
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Create the service in progress with the correct field names
            const { data: sipData } = await createServiceInProgress({
                variables: {
                    input: {
                        projectServiceId: parseInt(projectService.id),
                        assignedWorkerId: parseInt(serviceForm.assignedWorkerId),
                        serviceInProgressStatusId: parseInt(serviceForm.serviceInProgressStatusId),
                        startDate: serviceForm.startDate,
                        endDate: serviceForm.endDate || null,
                        cost: serviceForm.cost ? parseFloat(serviceForm.cost) : null
                    }
                }
            });

            const newServiceInProgressId = sipData.createServiceInProgress.id;

            // Then create tasks if they exist
            if (tasks.length > 0) {
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
            title="Create Service Implementation with Tasks"
            size="large"
        >
            <form onSubmit={handleSubmit} className="service-form">
                {/* Service details section */}
                <ServiceForm
                    serviceForm={serviceForm}
                    onChange={handleServiceFormChange}
                    projectService={projectService}
                    statuses={statuses}
                    workers={workers}
                />

                {/* Tasks section */}
                <TaskList
                    tasks={tasks}
                    onEdit={handleEditTask}
                    onRemove={handleRemoveTask}
                    onAddNewTask={handleAddTask}
                />

                <div className="form-actions">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!serviceForm.startDate || !serviceForm.assignedWorkerId || !serviceForm.serviceInProgressStatusId}
                    >
                        Create Service Implementation
                    </Button>
                </div>
            </form>

            {/* Task Edit/Add Modal */}
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