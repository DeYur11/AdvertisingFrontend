import ReviewCard from "./ReviewCard";

export default function AllReviewsTab({ reviews, workerId, onEditOwn, onDeleteOwn }) {
    const handleEditOwn = (review) => {
        onEditOwn(review);
    };

    const handleDeleteOwn = (reviewId) => {
        onDeleteOwn(reviewId);
    };

    return (
        <div className="all-reviews-tab">
            {reviews.map((review) => {
                const isMine = review.reviewer?.id === workerId.toString();

                return (
                    <ReviewCard
                        key={review.id}
                        review={review}
                        isMine={isMine}
                        onEditOwn={() => handleEditOwn(review)}
                        onDeleteOwn={(e) => {
                            e.stopPropagation();
                            handleDeleteOwn(review.id);
                        }}
                    />
                );
            })}
        </div>
    );
}