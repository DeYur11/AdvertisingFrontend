import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import { formatDate } from "../../utils/reviewerUtils";

/**
 * Відображає детальну інформацію про матеріал
 * і кнопку переходу до форми рецензії.
 */
export default function MaterialDetailsTab({
                                               material,
                                               existingReview,
                                               onOpenReview
                                           }) {
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
                    {material.status?.name || "Unknown"}
                </Badge>
            </div>

            {/* Опис */}
            {material.description && (
                <div className="detail-section">
                    <h4>Description</h4>
                    <p>{material.description}</p>
                </div>
            )}

            {/* Дві колонки властивостей */}
            <div className="detail-grid">
                {/* Колонка 1 */}
                <div className="detail-column">
                    <div className="detail-item">
                        <span className="detail-label">Material Type:</span>
                        <span className="detail-value">{material.type?.name || "—"}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Language:</span>
                        <span className="detail-value">{material.language?.name || "—"}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">
              {formatDate(material.createDatetime)}
            </span>
                    </div>
                </div>

                {/* Колонка 2 */}
                <div className="detail-column">
                    <div className="detail-item">
                        <span className="detail-label">Project:</span>
                        <span className="detail-value">
              {material.task?.serviceInProgress?.projectService?.project?.name ||
                  "—"}
            </span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Related Task:</span>
                        <span className="detail-value">{material.task?.name || "—"}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Task Priority:</span>
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
                    <h4>Keywords</h4>
                    <div className="keywords-container">
                        {material.keywords.map((k) => (
                            <span key={k.id} className="keyword-tag">
                #{k.name}
              </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Кнопка переходу до рецензії */}
            <div className="action-buttons">
                <Button variant="primary" onClick={onOpenReview}>
                    {existingReview ? "View My Review" : "Review This Material"}
                </Button>
            </div>
        </div>
    );
}
