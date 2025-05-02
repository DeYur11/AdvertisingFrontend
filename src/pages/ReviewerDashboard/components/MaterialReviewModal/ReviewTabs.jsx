import Button from "../../../../components/common/Button/Button";

export default function ReviewTabs({
                                       active,
                                       onChange,
                                       hasReviews,
                                       reviewsCount
                                   }) {
    return (
        <div className="review-tabs">
            <Button
                variant={active === "material" ? "primary" : "outline"}
                size="small"
                onClick={() => onChange("material")}
                className="tab-button"
            >
                Material Details
            </Button>

            <Button
                variant={active === "review" ? "primary" : "outline"}
                size="small"
                onClick={() => onChange("review")}
                className="tab-button"
            >
                Review Form
            </Button>

            {hasReviews && (
                <Button
                    variant={active === "all-reviews" ? "primary" : "outline"}
                    size="small"
                    onClick={() => onChange("all-reviews")}
                    className="tab-button"
                >
                    All Reviews ({reviewsCount})
                </Button>
            )}
        </div>
    );
}
