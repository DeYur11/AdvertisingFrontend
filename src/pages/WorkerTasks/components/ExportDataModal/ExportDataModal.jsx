// src/pages/WorkerTasks/components/ExportDataModal/ExportDataModal.jsx
import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import "./ExportDataModal.css";

// GraphQL запит для отримання даних для експорту
const GET_TASKS_FOR_EXPORT = gql`
    query GetTasksForExport($workerId: ID!, $input: PaginatedTasksInput!) {
        paginatedTasksByWorker(workerId: $workerId, input: $input) {
            content {
                id
                name
                description
                startDate
                deadline
                endDate
                priority
                value
                taskStatus {
                    name
                }
                serviceInProgress {
                    id
                    startDate
                    endDate
                    cost
                    status {
                        name
                    }
                    projectService {
                        service {
                            id
                            serviceName
                            serviceType {
                                name
                            }
                        }
                        project {
                            id
                            name
                            status {
                                name
                            }
                            client {
                                name
                            }
                            manager {
                                name
                                surname
                            }
                        }
                    }
                }
            }
            pageInfo {
                totalElements
            }
        }
    }
`;

export default function ExportDataModal({ isOpen, onClose, workerId, filter = {}, currentSortField, currentSortDirection }) {
    // Стан для опцій експорту
    const [exportFormat, setExportFormat] = useState("csv");
    const [selectedFields, setSelectedFields] = useState({
        taskName: true,
        taskDescription: false,
        priority: true,
        status: true,
        startDate: true,
        deadline: true,
        endDate: false,
        serviceName: true,
        serviceType: false,
        projectName: true,
        clientName: true,
        projectManager: false
    });
    const [includeHeaders, setIncludeHeaders] = useState(true);
    const [exportAll, setExportAll] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Запит на отримання даних для експорту
    const { loading, error, data } = useQuery(GET_TASKS_FOR_EXPORT, {
        variables: {
            workerId: String(workerId),
            input: {
                page: 0,
                size: 1000, // Обмежимо експорт до 1000 записів
                sortField: currentSortField,
                sortDirection: currentSortDirection,
                filter: {
                    ...filter,
                    // Конвертуємо ID в масивах до чисел
                    statusIds: filter.statusIds?.map(id => Number(id)) || undefined,
                    priorityIn: filter.priorityIn?.map(p => Number(p)) || undefined,
                    serviceInProgressIds: filter.serviceInProgressIds?.map(id => Number(id)) || undefined
                }
            }
        },
        skip: !isOpen,
        fetchPolicy: "network-only"
    });

    // Функція для перемикання всіх полів
    const toggleAllFields = (checked) => {
        const newState = {};
        Object.keys(selectedFields).forEach(key => {
            newState[key] = checked;
        });
        setSelectedFields(newState);
    };

    // Функція для обробки зміни вибору поля
    const handleFieldChange = (field) => {
        setSelectedFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Функція для експорту даних
    const exportData = () => {
        if (!data || !data.paginatedTasksByWorker || !data.paginatedTasksByWorker.content) {
            alert("Немає даних для експорту");
            return;
        }

        setIsExporting(true);

        try {
            const tasks = data.paginatedTasksByWorker.content;

            let result;
            if (exportFormat === "csv") {
                result = exportToCSV(tasks);
            } else if (exportFormat === "json") {
                result = exportToJSON(tasks);
            } else if (exportFormat === "excel") {
                result = exportToExcel(tasks);
            }

            if (result) {
                // Створюємо посилання для завантаження
                const element = document.createElement("a");
                element.href = result.url;
                element.download = result.filename;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        } catch (err) {
            console.error("Error exporting data:", err);
            alert("Сталася помилка під час експорту. Спробуйте ще раз.");
        } finally {
            setIsExporting(false);
        }
    };

    // Функція для експорту в CSV
    const exportToCSV = (tasks) => {
        const headers = [];
        if (selectedFields.taskName) headers.push("Task Name");
        if (selectedFields.taskDescription) headers.push("Description");
        if (selectedFields.priority) headers.push("Priority");
        if (selectedFields.status) headers.push("Status");
        if (selectedFields.startDate) headers.push("Start Date");
        if (selectedFields.deadline) headers.push("Deadline");
        if (selectedFields.endDate) headers.push("End Date");
        if (selectedFields.serviceName) headers.push("Service");
        if (selectedFields.serviceType) headers.push("Service Type");
        if (selectedFields.projectName) headers.push("Project");
        if (selectedFields.clientName) headers.push("Client");
        if (selectedFields.projectManager) headers.push("Project Manager");

        let csvContent = includeHeaders ? `${headers.join(",")}\n` : "";

        tasks.forEach(task => {
            const serviceName = task.serviceInProgress?.projectService?.service?.serviceName || "";
            const serviceType = task.serviceInProgress?.projectService?.service?.serviceType?.name || "";
            const projectName = task.serviceInProgress?.projectService?.project?.name || "";
            const clientName = task.serviceInProgress?.projectService?.project?.client?.name || "";
            const manager = task.serviceInProgress?.projectService?.project?.manager;
            const projectManager = manager ? `${manager.name} ${manager.surname}` : "";

            const row = [];
            if (selectedFields.taskName) row.push(`"${task.name.replace(/"/g, '""')}"`);
            if (selectedFields.taskDescription) row.push(`"${(task.description || "").replace(/"/g, '""')}"`);
            if (selectedFields.priority) row.push(task.priority || "");
            if (selectedFields.status) row.push(task.taskStatus?.name || "");
            if (selectedFields.startDate) row.push(task.startDate || "");
            if (selectedFields.deadline) row.push(task.deadline || "");
            if (selectedFields.endDate) row.push(task.endDate || "");
            if (selectedFields.serviceName) row.push(`"${serviceName.replace(/"/g, '""')}"`);
            if (selectedFields.serviceType) row.push(`"${serviceType.replace(/"/g, '""')}"`);
            if (selectedFields.projectName) row.push(`"${projectName.replace(/"/g, '""')}"`);
            if (selectedFields.clientName) row.push(`"${clientName.replace(/"/g, '""')}"`);
            if (selectedFields.projectManager) row.push(`"${projectManager.replace(/"/g, '""')}"`);

            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        return { url, filename: "tasks_export.csv" };
    };

    // Функція для експорту в JSON
    const exportToJSON = (tasks) => {
        const formattedTasks = tasks.map(task => {
            const formattedTask = {};

            if (selectedFields.taskName) formattedTask.name = task.name;
            if (selectedFields.taskDescription) formattedTask.description = task.description;
            if (selectedFields.priority) formattedTask.priority = task.priority;
            if (selectedFields.status) formattedTask.status = task.taskStatus?.name;
            if (selectedFields.startDate) formattedTask.startDate = task.startDate;
            if (selectedFields.deadline) formattedTask.deadline = task.deadline;
            if (selectedFields.endDate) formattedTask.endDate = task.endDate;

            if (selectedFields.serviceName || selectedFields.serviceType ||
                selectedFields.projectName || selectedFields.clientName ||
                selectedFields.projectManager) {

                formattedTask.service = {};

                if (selectedFields.serviceName)
                    formattedTask.service.name = task.serviceInProgress?.projectService?.service?.serviceName;

                if (selectedFields.serviceType)
                    formattedTask.service.type = task.serviceInProgress?.projectService?.service?.serviceType?.name;

                if (selectedFields.projectName || selectedFields.clientName || selectedFields.projectManager) {
                    formattedTask.service.project = {};

                    if (selectedFields.projectName)
                        formattedTask.service.project.name = task.serviceInProgress?.projectService?.project?.name;

                    if (selectedFields.clientName)
                        formattedTask.service.project.client = task.serviceInProgress?.projectService?.project?.client?.name;

                    if (selectedFields.projectManager) {
                        const manager = task.serviceInProgress?.projectService?.project?.manager;
                        formattedTask.service.project.manager = manager
                            ? `${manager.name} ${manager.surname}`
                            : null;
                    }
                }
            }

            return formattedTask;
        });

        const jsonContent = JSON.stringify(formattedTasks, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        return { url, filename: "tasks_export.json" };
    };

    // Функція для експорту в Excel (спрощено як CSV з іншим розширенням)
    const exportToExcel = (tasks) => {
        const csvExport = exportToCSV(tasks);
        return { ...csvExport, filename: "tasks_export.xlsx" };
    };

    const totalTasks = data?.paginatedTasksByWorker?.pageInfo?.totalElements || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Експорт даних задач"
            size="medium"
        >
            <div className="export-modal-content">
                {loading ? (
                    <div className="export-loading">Завантаження даних...</div>
                ) : error ? (
                    <div className="export-error">Помилка завантаження: {error.message}</div>
                ) : (
                    <>
                            <p>Доступно для експорту: <strong>{totalTasks}</strong> задач</p>
                        <div className="export-sections">
                            <div className="export-section">
                                <h3 className="export-section-title">Формат експорту</h3>
                                <div className="export-format-options">
                                    <label className="export-radio">
                                        <input
                                            type="radio"
                                            name="exportFormat"
                                            value="csv"
                                            checked={exportFormat === "csv"}
                                            onChange={() => setExportFormat("csv")}
                                        />
                                        <span className="radio-label">CSV</span>
                                    </label>
                                    <label className="export-radio">
                                        <input
                                            type="radio"
                                            name="exportFormat"
                                            value="json"
                                            checked={exportFormat === "json"}
                                            onChange={() => setExportFormat("json")}
                                        />
                                        <span className="radio-label">JSON</span>
                                    </label>
                                </div>
                            </div>

                            <div className="export-section">
                                <div className="export-section-header">
                                    <h3 className="export-section-title">Вибір полів для експорту</h3>
                                    <div className="export-select-all">
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => toggleAllFields(true)}
                                        >
                                            Вибрати все
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => toggleAllFields(false)}
                                        >
                                            Очистити все
                                        </Button>
                                    </div>
                                </div>

                                <div className="export-fields-grid">
                                    <div className="export-field-column">
                                        <h4 className="export-column-title">Задача</h4>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.taskName}
                                                onChange={() => handleFieldChange("taskName")}
                                            />
                                            <span>Назва задачі</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.taskDescription}
                                                onChange={() => handleFieldChange("taskDescription")}
                                            />
                                            <span>Опис</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.priority}
                                                onChange={() => handleFieldChange("priority")}
                                            />
                                            <span>Пріоритет</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.status}
                                                onChange={() => handleFieldChange("status")}
                                            />
                                            <span>Статус</span>
                                        </label>
                                    </div>

                                    <div className="export-field-column">
                                        <h4 className="export-column-title">Дати</h4>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.startDate}
                                                onChange={() => handleFieldChange("startDate")}
                                            />
                                            <span>Дата початку</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.deadline}
                                                onChange={() => handleFieldChange("deadline")}
                                            />
                                            <span>Дедлайн</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.endDate}
                                                onChange={() => handleFieldChange("endDate")}
                                            />
                                            <span>Дата завершення</span>
                                        </label>
                                    </div>

                                    <div className="export-field-column">
                                        <h4 className="export-column-title">Сервіс і проєкт</h4>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.serviceName}
                                                onChange={() => handleFieldChange("serviceName")}
                                            />
                                            <span>Назва сервісу</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.serviceType}
                                                onChange={() => handleFieldChange("serviceType")}
                                            />
                                            <span>Тип сервісу</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.projectName}
                                                onChange={() => handleFieldChange("projectName")}
                                            />
                                            <span>Назва проєкту</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.clientName}
                                                onChange={() => handleFieldChange("clientName")}
                                            />
                                            <span>Клієнт</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.projectManager}
                                                onChange={() => handleFieldChange("projectManager")}
                                            />
                                            <span>Менеджер проєкту</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {exportFormat === "csv" && (
                                <div className="export-section">
                                    <h3 className="export-section-title">Додаткові налаштування</h3>
                                    <label className="export-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={includeHeaders}
                                            onChange={() => setIncludeHeaders(!includeHeaders)}
                                        />
                                        <span>Включити заголовки полів</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="export-actions">
                            <Button
                                variant="outline"
                                onClick={onClose}
                            >
                                Скасувати
                            </Button>
                            <Button
                                variant="primary"
                                icon={isExporting ? "⏳" : "📊"}
                                onClick={exportData}
                                disabled={isExporting || !Object.values(selectedFields).some(v => v)}
                            >
                                {isExporting ? "Експортування..." : "Експортувати дані"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}