import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useMutation } from "@apollo/client";
import "./MaterialReviewModal.css";
import Button from "../../../../components/common/Button/Button";
import Modal from "../../../../components/common/Modal/Modal";
import Badge from "../../../../components/common/Badge/Badge";
import Card from "../../../../components/common/Card/Card";
import { formatDate } from "../../utils/reviewerUtils";
import { SUBMIT_MATERIAL_REVIEW, UPDATE_MATERIAL_REVIEW } from "../../graphql/reviewerQueries";

export default function MaterialReviewModal({
                                                isOpen,
                                                onClose,
                                                material,
                                                onReviewSubmitted
                                            }) {
    const user = useSelector(state => state.user);
    const [activeTab, setActiveTab] = useState("material");
    const [formData, setFormData] = useState({
        comments: "",
        suggestedChange: ""
    });
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [existingReview, setExistingReview] = useState(null);

    // Mutations for creating/updating reviews
    const [submitReview, { loading: submitting }] = useMutation(SUBMIT_MATERIAL_REVIEW);
    const [updateReview, { loading: updating }] = useMutation(UPDATE_MATERIAL_REVIEW);

    // Check if this material has already been reviewed by current user
    useEffect(() => {
        if (material?.reviews?.length) {
            const myReview = material.reviews.find(
                review => review.reviewer?.id === user.workerId.toString()
            );

            if (myReview) {
                setExistingReview(myReview);
                setFormData({
                    comments: myReview.comments || "",
                    suggestedChange: myReview.suggestedChange || ""
                });
            } else {
                setExistingReview(null);
                setFormData({
                    comments: "",
                    suggestedChange: ""
                });
            }
        }
    }, [material, user.workerId]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear any error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.comments.trim()) {
            newErrors.comments = "Please provide comments for your review";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Final confirmation before submitting
        if (!existingReview && !window.confirm("Are you sure you want to submit this review?")) {
            return;
        }

        try {
            if (existingReview && !isEditing) {
                // If review exists and we're not in edit mode, just close the modal
                onClose();
                return;
            }

            if (existingReview && isEditing) {
                // Update existing review
                await updateReview({
                    variables: {
                        id: existingReview.id,
                        input: {
                            materialId: parseInt(material.id),
                            reviewerId: parseInt(user.workerId),
                            comments: formData.comments,
                            suggestedChange: formData.suggestedChange
                        }
                    }
                });
            } else {
                // Submit new review
                await submitReview({
                    variables: {
                        input: {
                            materialId: parseInt(material.id),
                            reviewerId: parseInt(user.workerId),
                            comments: formData.comments,
                            suggestedChange: formData.suggestedChange
                        }
                    }
                });
            }

            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            setErrors(prev => ({
                ...prev,
                submit: error.message
            }));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Material Review"
            size="large"
        >
            <div className="material-review-modal">
                {/* Tabs */}
                <div className="review-tabs">
                    <Button
                        variant={activeTab === "material" ? "primary" : "outline"}
                        size="small"
                        onClick={() => setActiveTab("material")}
                        className="tab-button"
                    >
                        Material Details
                    </Button>
                    <Button
                        variant={activeTab === "review" ? "primary" : "outline"}
                        size="small"
                        onClick={() => setActiveTab("review")}
                        className="tab-button"
                    >
                        Review Form
                    </Button>
                    {material?.reviews?.length > 0 && (
                        <Button
                            variant={activeTab === "all-reviews" ? "primary" : "outline"}
                            size="small"
                            onClick={() => setActiveTab("all-reviews")}
                            className="tab-button"
                        >
                            All Reviews ({material.reviews.length})
                        </Button>
                    )}
                </div>

                {/* Material Details Tab */}
                {activeTab === "material" && (
                    <div className="material-details-tab">
                        <div className="section-header">
                            <h3>{material.name}</h3>
                            <Badge
                                variant={material.status?.name?.toLowerCase() === "accepted" ? "success" :
                                    material.status?.name?.toLowerCase() === "rejected" ? "danger" :
                                        material.status?.name?.toLowerCase() === "pending review" ? "warning" : "default"}
                                size="small"
                            >
                                {material.status?.name || "Unknown"}
                            </Badge>
                        </div>

                        {material.description && (
                            <div className="detail-section">
                                <h4>Description</h4>
                                <p>{material.description}</p>
                            </div>
                        )}

                        <div className="detail-grid">
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
                                    <span className="detail-value">{formatDate(material.createDatetime)}</span>
                                </div>
                            </div>

                            <div className="detail-column">
                                <div className="detail-item">
                                    <span className="detail-label">Project:</span>
                                    <span className="detail-value">
                                        {material.task?.serviceInProgress?.projectService?.project?.name || "—"}
                                    </span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Related Task:</span>
                                    <span className="detail-value">{material.task?.name || "—"}</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Task Priority:</span>
                                    <span className="detail-value">
                                        {material.task?.priority ?
                                            <Badge
                                                className={
                                                    parseInt(material.task.priority) >= 8 ? "priority-high" :
                                                        parseInt(material.task.priority) >= 4 ? "priority-medium" :
                                                            "priority-low"
                                                }
                                                size="small"
                                            >
                                                {material.task.priority}
                                            </Badge> : "—"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {material.keywords?.length > 0 && (
                            <div className="detail-section">
                                <h4>Keywords</h4>
                                <div className="keywords-container">
                                    {material.keywords.map(keyword => (
                                        <span key={keyword.id} className="keyword-tag">
                                            #{keyword.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="action-buttons">
                            <Button
                                variant="primary"
                                onClick={() => setActiveTab("review")}
                            >
                                {existingReview ? "View My Review" : "Review This Material"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Review Form Tab */}
                {activeTab === "review" && (
                    <div className="review-form-tab">
                        <form onSubmit={handleSubmit}>
                            {existingReview && !isEditing ? (
                                <>
                                    <div className="review-header">
                                        <h3>Your Review</h3>
                                        <span className="review-date">
                                            Submitted on: {formatDate(existingReview.createDatetime)}
                                        </span>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Comments</h4>
                                        <p className="review-text">{existingReview.comments || "No comments provided."}</p>
                                    </div>

                                    {existingReview.suggestedChange && (
                                        <div className="detail-section">
                                            <h4>Suggested Changes</h4>
                                            <p className="review-text">{existingReview.suggestedChange}</p>
                                        </div>
                                    )}

                                    <div className="action-buttons">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit Review
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={onClose}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="review-header">
                                        <h3>{existingReview ? "Edit Your Review" : "Submit Review"}</h3>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="comments">Comments*</label>
                                        <textarea
                                            id="comments"
                                            name="comments"
                                            value={formData.comments}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className={errors.comments ? "has-error" : ""}
                                            placeholder="Provide your feedback on this material..."
                                        ></textarea>
                                        {errors.comments && (
                                            <div className="error-message">{errors.comments}</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="suggestedChange">Suggested Changes</label>
                                        <textarea
                                            id="suggestedChange"
                                            name="suggestedChange"
                                            value={formData.suggestedChange}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Suggest any changes or improvements to this material..."
                                        ></textarea>
                                    </div>

                                    {errors.submit && (
                                        <div className="submit-error">{errors.submit}</div>
                                    )}

                                    <div className="action-buttons">
                                        {existingReview && isEditing && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsEditing(false)}
                                                type="button"
                                            >
                                                Cancel Edit
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={onClose}
                                            type="button"
                                        >
                                            {existingReview ? "Close Without Saving" : "Cancel"}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={submitting || updating}
                                        >
                                            {submitting || updating
                                                ? "Saving..."
                                                : existingReview
                                                    ? "Update Review"
                                                    : "Submit Review"
                                            }
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                )}

                {/* All Reviews Tab */}
                {activeTab === "all-reviews" && (
                    <div className="all-reviews-tab">
                        <h3>All Reviews ({material.reviews.length})</h3>

                        <div className="reviews-list">
                            {material.reviews.map(review => {
                                const isCurrentUserReview = review.reviewer?.id === user.workerId.toString();

                                return (
                                    <Card
                                        key={review.id}
                                        className={`review-card ${isCurrentUserReview ? 'my-review' : ''}`}
                                    >
                                        <div className="review-card-header">
                                            <div className="reviewer-info">
                                                <span className="reviewer-name">
                                                    {review.reviewer
                                                        ? `${review.reviewer.name} ${review.reviewer.surname}`
                                                        : "Unknown Reviewer"
                                                    }
                                                    {isCurrentUserReview && " (You)"}
                                                </span>
                                                <span className="review-date">
                                                    {formatDate(review.createDatetime)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="review-card-content">
                                            <div className="review-section">
                                                <h4>Comments</h4>
                                                <p>{review.comments || "No comments provided."}</p>
                                            </div>

                                            {review.suggestedChange && (
                                                <div className="review-section">
                                                    <h4>Suggested Changes</h4>
                                                    <p>{review.suggestedChange}</p>
                                                </div>
                                            )}
                                        </div>

                                        {isCurrentUserReview && (
                                            <div className="review-card-actions">
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => {
                                                        setActiveTab("review");
                                                        setIsEditing(true);
                                                    }}
                                                >
                                                    Edit My Review
                                                </Button>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}