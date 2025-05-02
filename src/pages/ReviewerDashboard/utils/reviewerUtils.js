/**
 * Utility functions for reviewer dashboard
 */

/**
 * Check if a material has been reviewed by the given reviewer
 * @param {Object} material - The material object
 * @param {string} reviewerId - The ID of the reviewer
 * @returns {boolean} Whether the material has been reviewed by the reviewer
 */
export const hasBeenReviewedBy = (material, reviewerId) => {
    if (!material?.reviews || !material.reviews.length || !reviewerId) {
        return false;
    }

    return material.reviews.some(review =>
        review.reviewer?.id === reviewerId.toString()
    );
};

/**
 * Get a review by a specific reviewer
 * @param {Object} material - The material object
 * @param {string} reviewerId - The ID of the reviewer
 * @returns {Object|null} The review object or null if not found
 */
export const getReviewByReviewer = (material, reviewerId) => {
    if (!material?.reviews || !material.reviews.length || !reviewerId) {
        return null;
    }

    return material.reviews.find(review =>
        review.reviewer?.id === reviewerId.toString()
    ) || null;
};

/**
 * Get status badge variant based on material status
 * @param {Object} material - The material object
 * @returns {string} The badge variant
 */
export const getStatusBadgeVariant = (material) => {
    if (!material.status) return "default";

    const statusName = material.status.name.toLowerCase();
    if (statusName === "accepted") return "success";
    if (statusName === "rejected") return "danger";
    if (statusName === "pending review") return "warning";
    return "default";
};

/**
 * Format a date string for display
 * @param {string} dateString - The date string
 * @returns {string} The formatted date
 */
export const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
};

/**
 * Get priority badge class based on priority value
 * @param {number} priority - The priority value
 * @returns {string} The badge class
 */
export const getPriorityBadgeClass = (priority) => {
    if (priority >= 8) return "priority-high";
    if (priority >= 4) return "priority-medium";
    return "priority-low";
};