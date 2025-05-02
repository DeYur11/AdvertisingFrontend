import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {useMutation, useQuery} from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import {
    GET_MATERIAL_SUMMARIES,
    SUBMIT_MATERIAL_REVIEW,
    UPDATE_MATERIAL_REVIEW
} from "../../graphql/reviewerQueries";
import { formatDate } from "../../utils/reviewerUtils";

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
        if (!material?.reviews?.length) return;

        const myReview = material.reviews.find(
            (r) => r.reviewer?.id === user.workerId.toString()
        );

        if (myReview) {
            setExistingReview(myReview);
            setFormData({
                comments: myReview.comments || "",
                suggestedChange: myReview.suggestedChange || "",
                reviewDate: myReview.reviewDate || "",
                materialSummaryId: null // або визначити з material, якщо доступно
            });
        } else {
            setExistingReview(null);
            setFormData({
                comments: "",
                suggestedChange: "",
                reviewDate: "",
                materialSummaryId: null
            });
        }
    }, [material, user.workerId]);


    // ------------- helpers -----------------
    const validate = () => {
        const errs = {};
        if (!formData.comments.trim()) errs.comments = "Поле обов’язкове";
        setErrors(errs);
        return !Object.keys(errs).length;
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
                    />
                )}

                {activeTab === "all-reviews" && (
                    <AllReviewsTab
                        reviews={material.reviews}
                        workerId={user.workerId}
                        onEditOwn={() => {
                            setActiveTab("review");
                            setIsEditing(true);
                        }}
                    />
                )}
            </div>
        </Modal>
    );
}
