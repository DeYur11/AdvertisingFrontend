import { useState } from "react";
import Card from "../../../../components/common/Card/Card";
import Button from "../../../../components/common/Button/Button";
import ConfirmationDialog from "../../../../components/common/ConfirmationDialog/ConfirmationDialog";
import { formatDate } from "../../utils/reviewerUtils";

// Status color constants
const STATUS_COLORS = {
    APPROVED: "#10b981", // Green
    REJECTED: "#ef4444", // Red
    PENDING: "#f59e0b", // Orange/Yellow
    IN_PROGRESS: "#3b82f6", // Blue
    DEFAULT: "#64748b" // Gray
};

export default function ReviewCard({ review, isMine, onEditOwn, onDeleteOwn }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const reviewerName = review.reviewer
        ? `${review.reviewer.name} ${review.reviewer.surname}`
        : "Unknown Reviewer";

    // Determine status color based on review or material status
    const getStatusColor = () => {
        if (!review.status) return STATUS_COLORS.DEFAULT;

        const status = typeof review.status === 'object'
            ? review.status.name?.toLowerCase()
            : review.status.toLowerCase();

        if (status.includes('approve') || status.includes('accept'))
            return STATUS_COLORS.APPROVED;
        if (status.includes('reject') || status.includes('decline'))
            return STATUS_COLORS.REJECTED;
        if (status.includes('pending'))
            return STATUS_COLORS.PENDING;
        if (status.includes('progress') || status.includes('review'))
            return STATUS_COLORS.IN_PROGRESS;

        return STATUS_COLORS.DEFAULT;
    };

    const handleEditClick = (e) => {
        e.stopPropagation(); // Prevent card collapse/expand when clicking button
        onEditOwn();
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Prevent card collapse/expand when clicking button
        setShowDeleteConfirmation(true);
    };

    // Get the summary text
    const getSummaryText = () => {
        if (!review.materialSummary) return "";
        return typeof review.materialSummary === 'object'
            ? review.materialSummary.name
            : review.materialSummary;
    };

    return (
        <>
            <Card
                className={`review-card ${isMine ? "my-review" : ""}`}
                onClick={() => setIsExpanded(!isExpanded)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <div className="review-card-header">
                    <div className="reviewer-info">
                        <span className="reviewer-name">
                            {reviewerName}
                            {isMine && " (You)"}
                        </span>
                        <span className="review-date">
                            {formatDate(review.reviewDate || review.createDatetime)}
                        </span>
                    </div>

                    {/* Material summary with status color */}
                    {review.materialSummary && (
                        <div
                            className="material-summary"
                            style={{
                                borderLeft: `3px solid ${getStatusColor()}`,
                                paddingLeft: '8px',
                                marginTop: '4px',
                                fontSize: '13px',
                                color: '#334155',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '100%'
                            }}
                        >
                            {getSummaryText()}
                        </div>
                    )}
                </div>

                {isExpanded && (
                    <div className="review-card-content">
                        {review.material && (
                            <div className="review-section">
                                <h4>Material</h4>
                                <p>{review.material.name || "—"}</p>
                            </div>
                        )}

                        {review.materialSummary && (
                            <div className="review-section">
                                <h4>Material Summary</h4>
                                <p>{getSummaryText()}</p>
                            </div>
                        )}

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
                )}

                {isMine && (
                    <div className="review-card-actions">
                        <Button
                            variant="outline"
                            size="small"
                            onClick={handleEditClick}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            size="small"
                            onClick={handleDeleteClick}
                        >
                            Delete
                        </Button>
                    </div>
                )}
            </Card>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onConfirm={onDeleteOwn}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
}