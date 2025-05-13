/**
 * Утилітні функції для панелі рецензента
 */

/**
 * Перевіряє, чи матеріал був рецензований вказаним рецензентом
 * @param {Object} material - Об'єкт матеріалу
 * @param {string} reviewerId - ID рецензента
 * @returns {boolean} Чи матеріал рецензувався цим рецензентом
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
 * Отримати рецензію конкретного рецензента
 * @param {Object} material - Об'єкт матеріалу
 * @param {string} reviewerId - ID рецензента
 * @returns {Object|null} Об'єкт рецензії або null, якщо не знайдено
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
 * Отримати варіант значка статусу на основі статусу матеріалу
 * @param {Object} material - Об'єкт матеріалу
 * @returns {string} Варіант значка
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
 * Форматує рядок дати для відображення
 * @param {string} dateString - Рядок з датою
 * @returns {string} Відформатована дата
 */
export const formatDate = (dateString) => {
    if (!dateString) return "—";

    // Використовуємо локалізацію для України
    return new Date(dateString).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Отримати клас значка пріоритету на основі значення пріоритету
 * @param {number} priority - Значення пріоритету
 * @returns {string} Клас значка
 */
export const getPriorityBadgeClass = (priority) => {
    if (priority >= 8) return "priority-high";
    if (priority >= 4) return "priority-medium";
    return "priority-low";
};