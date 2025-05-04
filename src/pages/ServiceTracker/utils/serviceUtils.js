// src/pages/ServiceTracker/utils/serviceUtils.js

/**
 * Calculate service progress percentage
 * @param {Object} projectService - The project service object
 * @returns {number} - The percentage of service implementation
 */
export const calculateProgress = (projectService) => {
    if (projectService.amount === 0) return 100;
    return Math.round((projectService.servicesInProgress.length / projectService.amount) * 100);
};

/**
 * Get missing implementation count
 * @param {Object} projectService - The project service object
 * @returns {number} - The number of missing implementations
 */
export const getMissingCount = (projectService) => {
    return projectService.amount - projectService.servicesInProgress.length;
};

/**
 * Format worker name from worker object
 * @param {Object} worker - The worker object
 * @returns {string} - Formatted worker name
 */
export const formatWorkerName = (worker) => {
    if (!worker) return "Unknown";
    return `${worker.name} ${worker.surname}`;
};

/**
 * Get worker name by ID from workers array
 * @param {string} workerId - The worker ID
 * @param {Array} workers - Array of worker objects
 * @returns {string} - Formatted worker name
 */
export const getWorkerNameById = (workerId, workers) => {
    const worker = workers.find(w => w.id === workerId);
    return formatWorkerName(worker);
};