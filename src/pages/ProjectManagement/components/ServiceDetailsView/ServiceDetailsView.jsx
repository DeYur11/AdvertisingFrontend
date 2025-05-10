import { useQuery } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Badge from "../../../../components/common/Badge/Badge";
import Card from "../../../../components/common/Card/Card";
import Button from "../../../../components/common/Button/Button";
import {
    GET_SERVICES_IN_PROGRESS_BY_PS,
    GET_PROJECT_DETAILS
} from "../../graphql/projects.gql";
import "./ServiceDetailsView.css";

export default function ServiceDetailsView({
                                               isOpen,
                                               onClose,
                                               projectService,
                                               onShowImplementationDetails
                                           }) {
    // Запит реалізацій сервісу та деталей проекту
    const { data: sipData, loading: sipLoading, error: sipError } = useQuery(
        GET_SERVICES_IN_PROGRESS_BY_PS,
        {
            variables: { projectServiceId: projectService?.id || "" },
            skip: !projectService?.id,
            fetchPolicy: "network-only"
        }
    );

    const { data: projectData } = useQuery(
        GET_PROJECT_DETAILS,
        {
            variables: { projectId: projectService?.project?.id || "" },
            skip: !projectService?.project?.id,
            fetchPolicy: "network-only"
        }
    );

    if (!isOpen || !projectService) return null;

    const project = projectData?.project || projectService?.project || {};
    const svc = projectService.service || {};
    const missingCount = (projectService?.amount || 0) - (projectService?.servicesInProgress?.length || 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return "—";
        }
    };

    const calculateTaskCompletion = (sip) => {
        const tasks = sip?.tasks || [];
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(task => task.taskStatus?.name?.toLowerCase() === "completed").length;
        return Math.round((completed / tasks.length) * 100);
    };

    const handleImplClick = (implementation) => {
        if (onShowImplementationDetails) {
            onShowImplementationDetails(implementation);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Деталі сервісу: ${svc.serviceName || "—"}`}
            size="large"
        >
            <div className="service-details-container">
                <section className="service-overview">
                    <Card variant="elevated" className="overview-card">
                        <h3 className="section-header">Загальна інформація</h3>

                        <div className="service-info-grid">
                            <div className="service-main-info">
                                <div className="service-primary-details">
                                    <h4 className="sub-heading">Сервіс</h4>
                                    <div className="detail-group">
                                        <div className="detail-item">
                                            <span className="detail-label">Назва:</span>
                                            <span className="detail-value">{svc.serviceName || "—"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Тип:</span>
                                            <span className="detail-value">{svc.serviceType?.name || "—"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Ціна:</span>
                                            <span className="detail-value cost">
                                                {svc.estimateCost ? `₴${parseFloat(svc.estimateCost).toFixed(2)}` : "—"}
                                            </span>
                                        </div>
                                        {svc.duration && (
                                            <div className="detail-item">
                                                <span className="detail-label">Тривалість:</span>
                                                <span className="detail-value">{svc.duration} днів</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="project-primary-details">
                                    <h4 className="sub-heading">Проект</h4>
                                    <div className="detail-group">
                                        <div className="detail-item">
                                            <span className="detail-label">Назва:</span>
                                            <span className="detail-value">{project?.name || "—"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Клієнт:</span>
                                            <span className="detail-value">{project?.client?.name || "—"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Статус:</span>
                                            <Badge
                                                variant={project?.status?.name?.toLowerCase() === "completed" ? "success" : "primary"}
                                                size="small"
                                            >
                                                {project?.status?.name || "—"}
                                            </Badge>
                                        </div>
                                        {project?.manager && (
                                            <div className="detail-item">
                                                <span className="detail-label">Менеджер:</span>
                                                <span className="detail-value">
                                                    {project.manager.name || "—"} {project.manager.surname || ""}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="service-implementation-stats">
                                <h4 className="sub-heading">Статистика виконання</h4>
                                <div className="stats-container">
                                    <div className="stat-item">
                                        <div className="stat-value">{projectService?.amount || 0}</div>
                                        <div className="stat-label">Необхідно</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value completed">{projectService?.servicesInProgress?.length || 0}</div>
                                        <div className="stat-label">Поточно</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value missing">{missingCount > 0 ? missingCount : 0}</div>
                                        <div className="stat-label">Відсутні</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {project?.description && (
                            <div className="project-description">
                                <h4 className="sub-heading">Опис проекту</h4>
                                <p>{project.description}</p>
                            </div>
                        )}
                    </Card>
                </section>

                <section className="implementations-section">
                    <h3 className="section-header">Реалізації сервісу <span className="count-badge">{sipData?.servicesInProgressByProjectService?.length || 0}</span></h3>

                    {sipLoading ? (
                        <div className="loading-message">Завантаження реалізацій сервісу...</div>
                    ) : sipError ? (
                        <div className="error-message">Помилка завантаження: {sipError.message}</div>
                    ) : !sipData?.servicesInProgressByProjectService?.length ? (
                        <div className="no-implementations">
                            <p>Жодної реалізації сервісу ще не створено.</p>
                        </div>
                    ) : (
                        <div className="implementations-grid">
                            {sipData.servicesInProgressByProjectService.map(sip => (
                                <Card key={sip.id} className="implementation-card" onClick={() => handleImplClick(sip)}>
                                    <div className="implementation-header">
                                        <Badge
                                            variant={sip.status?.name?.toLowerCase() === "completed" ? "success" : "primary"}
                                            size="medium"
                                        >
                                            {sip.status?.name || "Статус невідомий"}
                                        </Badge>
                                        <Button size="small" variant="outline" className="details-button">Деталі</Button>
                                    </div>

                                    <div className="implementation-details-row">
                                        <div className="detail-item">
                                            <span className="detail-label">Початок:</span>
                                            <span className="detail-value">{formatDate(sip.startDate)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Кінець:</span>
                                            <span className="detail-value">{formatDate(sip.endDate)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Вартість:</span>
                                            <span className="detail-value cost">
                                                {sip.cost ? `₴${parseFloat(sip.cost).toFixed(2)}` : "—"}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Задачі:</span>
                                            <span className="detail-value">{sip.tasks?.length || 0} задач</span>
                                        </div>
                                    </div>

                                    <div className="task-progress">
                                        <div className="progress-label">
                                            <span>Виконання задач</span>
                                            <span>{calculateTaskCompletion(sip)}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className={`progress-fill status-${sip.status?.name?.toLowerCase()}`}
                                                style={{ width: `${calculateTaskCompletion(sip)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {sip.tasks?.length > 0 && (
                                        <div className="tasks-summary">
                                            <div className="tasks-header">
                                                <h4>Задачі ({sip.tasks.length})</h4>
                                            </div>

                                            <div className="task-status-summary">
                                                {(() => {
                                                    const completed = sip.tasks.filter(t => t.taskStatus?.name?.toLowerCase() === "completed").length;
                                                    const inProgress = sip.tasks.filter(t => t.taskStatus?.name?.toLowerCase() === "in progress").length;
                                                    const pending = sip.tasks.filter(t =>
                                                        t.taskStatus?.name?.toLowerCase() !== "completed" &&
                                                        t.taskStatus?.name?.toLowerCase() !== "in progress"
                                                    ).length;

                                                    return (
                                                        <>
                                                            <div className="task-status-item">
                                                                <span className="status-indicator completed"></span>
                                                                <span className="status-count">{completed}</span>
                                                                <span className="status-label">Завершено</span>
                                                            </div>
                                                            <div className="task-status-item">
                                                                <span className="status-indicator in-progress"></span>
                                                                <span className="status-count">{inProgress}</span>
                                                                <span className="status-label">В роботі</span>
                                                            </div>
                                                            <div className="task-status-item">
                                                                <span className="status-indicator pending"></span>
                                                                <span className="status-count">{pending}</span>
                                                                <span className="status-label">Очікує</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Modal>
    );
}