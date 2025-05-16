import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import { formatDate } from "../../utils/reviewerUtils";
import "./ClickableLinks.css";

/**
 * Відображає детальну інформацію про матеріал
 * і кнопку переходу до форми рецензії.
 */
export default function MaterialDetailsTab({
                                               material,
                                               existingReview,
                                               onOpenReview,
                                               onProjectClick,
                                               onTaskClick
                                           }) {
    // Функція для обробки кліку по проекту
    const handleProjectClick = () => {
        if (material.task?.serviceInProgress?.projectService?.project && onProjectClick) {
            onProjectClick(material.task.serviceInProgress.projectService.project);
        }
    };

    // Функція для обробки кліку по завданню
    const handleTaskClick = () => {
        if (material.task && onTaskClick) {
            onTaskClick(material.task);
        }
    };

    // Визначаємо текст кнопки на основі статусу матеріалу та наявності рецензії
    const getButtonText = () => {
        if (material.status?.name !== "Pending Review") {
            return "Рецензування недоступне";
        }

        if (existingReview) {
            return "Переглянути мою рецензію";
        }

        return "Рецензувати матеріал";
    };

    return (
        <div className="material-details-tab">
            {/* Заголовок + статус */}
            <div className="section-header">
                <h3>{material.name}</h3>

                <Badge
                    variant={
                        material.status?.name?.toLowerCase() === "accepted"
                            ? "success"
                            : material.status?.name?.toLowerCase() === "rejected"
                                ? "danger"
                                : material.status?.name?.toLowerCase() === "pending review"
                                    ? "warning"
                                    : "default"
                    }
                    size="small"
                >
                    {material.status?.name || "Невідомо"}
                </Badge>
            </div>

            {/* Опис */}
            {material.description && (
                <div className="detail-section">
                    <h4>Опис</h4>
                    <p>{material.description}</p>
                </div>
            )}

            {/* Дві колонки властивостей */}
            <div className="detail-grid">
                {/* Колонка 1 */}
                <div className="detail-column">
                    <div className="detail-item">
                        <span className="detail-label">Тип матеріалу:</span>
                        <span className="detail-value">{material.materialType?.name || "—"}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Мова:</span>
                        <span className="detail-value">{material.language?.name || "—"}</span>
                    </div>
                </div>

                {/* Колонка 2 */}
                <div className="detail-column">
                    <div className="detail-item">
                        <span className="detail-label">Проект:</span>
                        <span
                            className={`detail-value ${material.task?.serviceInProgress?.projectService?.project ? "clickable-link" : ""}`}
                            onClick={material.task?.serviceInProgress?.projectService?.project ? handleProjectClick : undefined}
                            title={material.task?.serviceInProgress?.projectService?.project ? "Натисніть для перегляду деталей проекту" : ""}
                        >
                            {material.task?.serviceInProgress?.projectService?.project?.name || "—"}
                        </span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Пов'язане завдання:</span>
                        <span
                            className={`detail-value ${material.task ? "clickable-link" : ""}`}
                            onClick={material.task ? handleTaskClick : undefined}
                            title={material.task ? "Натисніть для перегляду деталей завдання" : ""}
                        >
                            {material.task?.name || "—"}
                        </span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Пріоритет завдання:</span>
                        <span className="detail-value">
                            {material.task?.priority ? (
                                <Badge
                                    className={
                                        parseInt(material.task.priority, 10) >= 8
                                            ? "priority-high"
                                            : parseInt(material.task.priority, 10) >= 4
                                                ? "priority-medium"
                                                : "priority-low"
                                    }
                                    size="small"
                                >
                                    {material.task.priority}
                                </Badge>
                            ) : (
                                "—"
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Ключові слова */}
            {material.keywords?.length > 0 && (
                <div className="detail-section">
                    <h4>Ключові слова</h4>
                    <div className="keywords-container">
                        {material.keywords.map((k) => (
                            <span key={k.id} className="keyword-tag">
                                #{k.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Повідомлення про наявність власної рецензії */}
            {existingReview && material.status?.name === "Pending Review" && (
                <div className="review-notice success">
                    <p>Ви вже рецензували цей матеріал. Ви можете переглянути або відредагувати свою рецензію.</p>
                </div>
            )}

            {/* Кнопка переходу до рецензії */}
            <div className="action-buttons">
                <Button
                    variant="primary"
                    onClick={onOpenReview}
                    disabled={material.status?.name !== "Pending Review" && !existingReview}
                >
                    {getButtonText()}
                </Button>
            </div>
        </div>
    );
}