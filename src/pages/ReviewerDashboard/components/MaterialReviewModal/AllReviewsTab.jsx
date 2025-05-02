import { useState } from "react";
import Card from "../../../../components/common/Card/Card";
import Button from "../../../../components/common/Button/Button";
import { formatDate } from "../../utils/reviewerUtils";

export default function AllReviewsTab({ reviews, workerId, onEditOwn }) {
    const [hoveredReviewId, setHoveredReviewId] = useState(null);

    return (
        <div className="all-reviews-tab">
            {reviews.map((review) => {
                const isMine = review.reviewer?.id === workerId.toString();
                const isExpanded = hoveredReviewId === review.id;

                return (
                    <Card
                        key={review.id}
                        className={`review-card ${isMine ? "my-review" : ""}`}
                        onMouseEnter={() => setHoveredReviewId(review.id)}
                        onMouseLeave={() => setHoveredReviewId(null)}
                    >
                        <div className="review-card-header">
                            <div className="reviewer-info">
                                <span className="reviewer-name">
                                    {review.reviewer
                                        ? `${review.reviewer.name} ${review.reviewer.surname}`
                                        : "Unknown Reviewer"}
                                    {isMine && " (You)"}
                                </span>
                                <span className="review-date">
                                    {formatDate(review.reviewDate)}
                                </span>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="review-card-content">
                                <div className="review-section">
                                    <strong>Матеріал:</strong>
                                    <p>{review.material?.name || "—"}</p>
                                </div>

                                <div className="review-section">
                                    <strong>Матеріал (версія):</strong>
                                    <p>{review.materialSummary?.name || "—"}</p>
                                </div>

                                <div className="review-section">
                                    <strong>Коментарі:</strong>
                                    <p>{review.comments || "—"}</p>
                                </div>

                                <div className="review-section">
                                    <strong>Запропоновані зміни:</strong>
                                    <p>{review.suggestedChange || "—"}</p>
                                </div>

                                <div className="review-section">
                                    <strong>Дата створення:</strong>
                                    <p>{formatDate(review.createDatetime)}</p>
                                </div>

                                {review.updateDatetime && (
                                    <div className="review-section">
                                        <strong>Дата оновлення:</strong>
                                        <p>{formatDate(review.updateDatetime)}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isMine && (
                            <div className="review-card-actions">
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={onEditOwn}
                                >
                                    Edit My Review
                                </Button>
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
