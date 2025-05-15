// src/pages/ServiceTracker Page/utils/projectDateUtils.js

/**
 * Check if a project is older than the specified number of days
 * @param {string|Date} endDate - The project's end date
 * @param {number} days - Number of days (default: 30)
 * @returns {boolean} - True if project ended more than specified days ago
 */
export const isProjectOlderThan = (endDate, days = 30) => {
    if (!endDate) return false;

    // Parse the end date
    const projectEndDate = new Date(endDate);

    // Get current date
    const currentDate = new Date();

    // Calculate the cutoff date (30 days ago from today)
    const cutoffDate = new Date();
    cutoffDate.setDate(currentDate.getDate() - days);

    // Return true if the project end date is before the cutoff date
    return projectEndDate < cutoffDate;
};

/**
 * Checks if modifications to a project are allowed
 * @param {Object} project - The project object
 * @returns {Object} - Contains isLocked boolean and message string if locked
 */
export const isProjectLocked = (project) => {
    if (!project) return { isLocked: false };

    // Get the project end date
    const endDate = project.endDate;

    // Check if project ended more than 30 days ago
    const isLocked = isProjectOlderThan(endDate, 30);

    return {
        isLocked,
        message: isLocked ?
            "Цей проект закінчився більше ніж 30 днів тому. Модифікації заблоковано." :
            null
    };
};