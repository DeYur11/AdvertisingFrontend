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
 * Filter materials based on filter criteria
 * @param {Array} materials - The list of materials
 * @param {Object} filters - Filter criteria object
 * @param {string} searchQuery - Search query string
 * @param {string} reviewerId - The ID of the current reviewer
 * @returns {Array} Filtered materials
 */
export const filterMaterials = (materials, filters, searchQuery, reviewerId) => {
    if (!materials) return [];

    return materials.filter(material => {
        // Filter by search query
        if (searchQuery) {
            const searchQueryLower = searchQuery.toLowerCase();
            const nameMatch = material.name?.toLowerCase().includes(searchQueryLower);
            const descriptionMatch = material.description?.toLowerCase().includes(searchQueryLower);

            if (!nameMatch && !descriptionMatch) {
                return false;
            }
        }

        // Filter by status
        if (filters.status && filters.status.length > 0) {
            if (!material.status || !filters.status.includes(material.status.id)) {
                return false;
            }
        }

        // Filter by material type
        if (filters.materialType && filters.materialType.length > 0) {
            if (!material.type || !filters.materialType.includes(material.type.id)) {
                return false;
            }
        }

        // Filter by language
        if (filters.language && filters.language.length > 0) {
            if (!material.language || !filters.language.includes(material.language.id)) {
                return false;
            }
        }

        // Filter by review status
        if (filters.reviewStatus) {
            const hasBeenReviewedByCurrentUser = hasBeenReviewedBy(material, reviewerId);

            if (filters.reviewStatus === 'reviewed' && !hasBeenReviewedByCurrentUser) {
                return false;
            }

            if (filters.reviewStatus === 'pending' && hasBeenReviewedByCurrentUser) {
                return false;
            }
        }

        // Filter by date range
        if (filters.dateRange) {
            const materialDate = new Date(material.createDatetime);

            if (filters.dateRange.from) {
                const fromDate = new Date(filters.dateRange.from);
                if (materialDate < fromDate) {
                    return false;
                }
            }

            if (filters.dateRange.to) {
                const toDate = new Date(filters.dateRange.to);
                // Set time to end of day for the to date
                toDate.setHours(23, 59, 59, 999);
                if (materialDate > toDate) {
                    return false;
                }
            }
        }

        return true;
    });
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
 * Get rating badge variant based on rating value
 * @param {number} rating - The rating value (1-10)
 * @returns {string} The badge variant
 */
export const getRatingBadgeVariant = (rating) => {
    if (rating >= 7) return "success";
    if (rating >= 4) return "warning";
    return "danger";
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