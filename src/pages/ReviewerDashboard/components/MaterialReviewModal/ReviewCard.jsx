import Card from "../../../../components/common/Card/Card";
import Button from "../../../../components/common/Button/Button";
import { formatDate } from "../../utils/reviewerUtils";

export default function ReviewCard({ review, isMine, onEditOwn }) {
    const reviewerName = review.reviewer
        ? `${review.reviewer.name} ${review.reviewer.surname}`
        : "Unknown Reviewer";

    const materialName = review.material?.name || "—";
    const summaryName = review.materialSummary?.name || "—";

    return (
        <Card className={`review-card ${isMine ? "my-review" : ""}`}>
            <div className="review-card-header">
                <div className="reviewer-info">
                    <span className="reviewer-name">
                        {reviewerName}
                        {isMine && " (You)"}
                    </span>
                    <span className="review-date">
                        {formatDate(review.reviewDate)}
                    </span>
                </div>
            </div>

            <div className="review-card-content">
                <div className="review-section">
                    <h4>Material</h4>
                    <p>{materialName}</p>
                </div>

                <div className="review-section">
                    <h4>Material Summary</h4>
                    <p>{summaryName}</p>
                </div>

                <div className="review-section">
                    <h4>Comments</h4>
                    <p>{review.comments || "No comments provided."}</p>
                </div>

                <div className="review-section">
                    <h4>Suggested Changes</h4>
                    <p>{review.suggestedChange || "—"}</p>
                </div>

                <div className="review-section">
                    <h4>Created</h4>
                    <p>{formatDate(review.createDatetime)}</p>
                </div>

                {review.updateDatetime && (
                    <div className="review-section">
                        <h4>Last Updated</h4>
                        <p>{formatDate(review.updateDatetime)}</p>
                    </div>
                )}
            </div>

            {isMine && (
                <div className="review-card-actions">
                    <Button variant="outline" size="small" onClick={onEditOwn}>
                        Edit My Review
                    </Button>
                </div>
            )}
        </Card>
    );
}
