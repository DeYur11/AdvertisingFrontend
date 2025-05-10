// src/pages/ProjectManagement/components/ServiceImplementationDetailsModal/ServiceImplementationDetailsModal.jsx
import { useQuery } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Badge from "../../../../components/common/Badge/Badge";
import Card from "../../../../components/common/Card/Card";
import "./ServiceImplementationDetailsModal.css";

export default function ServiceImplementationDetailsModal({
                                                              isOpen,
                                                              onClose,
                                                              serviceImplementation
                                                          }) {
    if (!isOpen || !serviceImplementation) return null;

    // Форматування дати
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString('uk-UA');
    };

    // Розрахунок статистики виконання завдань
    const totalTasks = serviceImplementation.tasks?.length || 0;
    const completedTasks = serviceImplementation.tasks?.filter(
        task => task.taskStatus?.name?.toLowerCase() === "completed"
    ).length || 0;
    const taskCompletionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Деталі виконання сервісу"
            size="large"
        >
            <div className="sipm-details-container">
                <section className="sipm-overview">
                    <h3>Огляд виконання</h3>
                    <div className="sipm-header-info">
                        <div className="sipm-status">
                            <Badge
                                variant={serviceImplementation.status?.name?.toLowerCase() === "completed" ? "success" : "primary"}
                                size="medium"
                            >
                                {serviceImplementation.status?.name || "—"}
                            </Badge>
                        </div>

                        <div className="sipm-dates">
                            <div className="sipm-date-item">
                                <span className="sipm-date-label">Дата початку:</span>
                                <span className="sipm-date-value">{formatDate(serviceImplementation.startDate)}</span>
                            </div>
                            <div className="sipm-date-item">
                                <span className="sipm-date-label">Дата завершення:</span>
                                <span className="sipm-date-value">{formatDate(serviceImplementation.endDate)}</span>
                            </div>
                        </div>

                        <div className="sipm-cost">
                            <span className="sipm-cost-label">Вартість:</span>
                            <span className="sipm-cost-value">{parseFloat(serviceImplementation.cost || 0).toFixed(2)} ₴</span>
                        </div>
                    </div>

                    <div className="sipm-task-progress-container">
                        <div className="sipm-progress-header">
                            <h4>Виконання завдань</h4>
                            <span className="sipm-progress-percent">{taskCompletionPercent}%</span>
                        </div>
                        <div className="sipm-progress-bar">
                            <div
                                className="sipm-progress-fill"
                                style={{ width: `${taskCompletionPercent}%` }}
                            ></div>
                        </div>
                        <div className="sipm-progress-stats">
                            <span className="sipm-progress-stat">{completedTasks} з {totalTasks} завдань виконано</span>
                        </div>
                    </div>
                </section>

                <section className="sipm-tasks-section">
                    <h3>Завдання</h3>

                    {!serviceImplementation.tasks?.length ? (
                        <div className="sipm-no-tasks-message">Для цього виконання завдань ще не додано.</div>
                    ) : (
                        <div className="sipm-tasks-list">
                            {serviceImplementation.tasks.map(task => (
                                <Card key={task.id} className="sipm-task-item">
                                    <div className="sipm-task-header">
                                        <h4 className="sipm-task-name">{task.name}</h4>
                                        <Badge
                                            variant={
                                                task.taskStatus?.name?.toLowerCase() === "completed" ? "success" :
                                                    task.taskStatus?.name?.toLowerCase() === "in progress" ? "primary" :
                                                        "warning"
                                            }
                                            size="small"
                                        >
                                            {task.taskStatus?.name || "—"}
                                        </Badge>
                                    </div>

                                    {task.description && (
                                        <div className="sipm-task-description">
                                            <p>{task.description}</p>
                                        </div>
                                    )}

                                    <div className="sipm-task-details">
                                        <div className="sipm-task-detail-item">
                                            <span className="sipm-detail-label">Пріоритет:</span>
                                            <span className="sipm-detail-value">{task.priority || "—"}</span>
                                        </div>
                                        <div className="sipm-task-detail-item">
                                            <span className="sipm-detail-label">Термін:</span>
                                            <span className="sipm-detail-value">{formatDate(task.deadline)}</span>
                                        </div>
                                        <div className="sipm-task-detail-item">
                                            <span className="sipm-detail-label">Виконує:</span>
                                            <span className="sipm-detail-value">
                                                {task.assignedWorker
                                                    ? `${task.assignedWorker.name || ""} ${task.assignedWorker.surname || ""}`
                                                    : "—"}
                                            </span>
                                        </div>
                                        {task.value && (
                                            <div className="sipm-task-detail-item">
                                                <span className="sipm-detail-label">Оцінка:</span>
                                                <span className="sipm-detail-value">{parseFloat(task.value).toFixed(2)} ₴</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Modal>
    );
}
