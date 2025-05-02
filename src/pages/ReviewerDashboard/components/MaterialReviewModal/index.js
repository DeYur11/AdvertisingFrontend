import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import {
    GET_MATERIAL_SUMMARIES,
    SUBMIT_MATERIAL_REVIEW,
    UPDATE_MATERIAL_REVIEW,
    DELETE_MATERIAL_REVIEW
} from "../../graphql/reviewerQueries";


import ReviewTabs from "./ReviewTabs";
import MaterialDetailsTab from "./MaterialDetailsTab";
import ReviewFormTab from "./ReviewFormTab";
import AllReviewsTab from "./AllReviewsTab";

import "./MaterialReviewModal.css";

export default function MaterialReviewModal({
                                                isOpen,
                                                onClose,
                                                material,
                                                onReviewSubmitted
                                            }) {
    const user = useSelector((state) => state.user);
    const [deleteReview, { loading: deleting }] = useMutation(DELETE_MATERIAL_REVIEW, {
        refetchQueries: ["GetMaterialById"], // or whatever query you use to fetch the material details
        onCompleted: () => {
            // Success notification if needed
        },
        onError: (error) => {
            console.error("Error deleting review:", error);
            // Error notification if needed
        }
    });


    // ---------------- state ----------------
    const [activeTab, setActiveTab] = useState("material");
    const [formData, setFormData] = useState({
        comments: "",
        suggestedChange: "",
        reviewDate: "", // формат: YYYY-MM-DD
        materialSummaryId: null
    });
    const { data: summariesData, loading: summariesLoading } = useQuery(GET_MATERIAL_SUMMARIES);
    const materialSummaries = summariesData?.materialSummaries || [];
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [existingReview, setExistingReview] = useState(null);

    // -------------- mutations --------------
    const [submitReview, { loading: submitting }] =
        useMutation(SUBMIT_MATERIAL_REVIEW);
    const [updateReview, { loading: updating }] =
        useMutation(UPDATE_MATERIAL_REVIEW);

    // ------------- effects -----------------
    useEffect(() => {
        // при відкритті форми — завжди готувати до додавання
        setExistingReview(null);
        setIsEditing(false);
        setFormData({
            comments: "",
            suggestedChange: "",
            reviewDate: "",
            materialSummaryId: null
        });
    }, [material?.id, isOpen]);


    // ------------- helpers -----------------
    const validate = () => {
        const errs = {};
        if (!formData.comments.trim()) errs.comments = "Поле обов'язкове";
        setErrors(errs);
        return !Object.keys(errs).length;
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            console.log(reviewId);
            await deleteReview({
                variables: {
                    id: reviewId
                }
            });

            // If the deleted review was the one being edited, clear the form
            if (existingReview && existingReview.id === reviewId) {
                setExistingReview(null);
                setIsEditing(false);
                setFormData({
                    comments: "",
                    suggestedChange: "",
                    reviewDate: "",
                    materialSummaryId: null
                });
            }
            onReviewSubmitted?.();
        } catch (error) {
            console.error("Failed to delete review:", error);
        }
    };

    const handleEditReview = (review) => {
        console.log(review)
        setExistingReview(review);
        setFormData({
            comments: review.comments || "",
            suggestedChange: review.suggestedChange || "",
            reviewDate: review.reviewDate || "",
            materialSummaryId: review.materialSummary?.id || null
        });
        setIsEditing(true);
        setActiveTab("review");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const input = {
            materialId: +material.id,
            reviewerId: +user.workerId,
            comments: formData.comments,
            suggestedChange: formData.suggestedChange,
            reviewDate: formData.reviewDate || null,
            materialSummaryId: formData.materialSummaryId || null
        };
        try {
            if (existingReview && !isEditing) return onClose();

            if (existingReview && isEditing) {
                input.id = existingReview.id;
                console.log(input);
                await updateReview({
                    variables: {
                        id: existingReview.id,
                        input
                    }
                });
            } else {
                await submitReview({
                    variables: {
                        input
                    }
                });
            }
            onReviewSubmitted?.();
            onClose();
        } catch (err) {
            setErrors((p) => ({ ...p, submit: err.message }));
        }
    };

    // ---------------------------------------
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Material Review" size="large">
            <div className="material-review-modal">
                <ReviewTabs
                    active={activeTab}
                    hasReviews={!!material?.reviews?.length}
                    onChange={setActiveTab}
                    reviewsCount={material?.reviews?.length || 0}
                />

                {activeTab === "material" && (
                    <MaterialDetailsTab
                        material={material}
                        existingReview={!!existingReview}
                        onOpenReview={() => setActiveTab("review")}
                    />
                )}

                {activeTab === "review" && (
                    <ReviewFormTab
                        material={material}
                        formData={formData}
                        errors={errors}
                        setFormData={setFormData}
                        submitting={submitting || updating}
                        existingReview={existingReview}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onClose={onClose}
                        onSubmit={handleSubmit}
                        materialSummaries={materialSummaries}
                        // ❌ ⛔️ тут бракує:
                        setExistingReview={setExistingReview}
                    />
                )}


                {activeTab === "all-reviews" && (
                    <AllReviewsTab
                        reviews={material.reviews}
                        workerId={user.workerId}
                        onEditOwn={handleEditReview}
                        onDeleteOwn={handleDeleteReview}
                    />
                )}
            </div>
        </Modal>
    );
}