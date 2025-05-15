// src/utils/ErrorHandlingUtils.js
import { toast } from 'react-toastify';

/**
 * Execute a mutation with error handling and toast notifications
 * @param {Function} mutationFn - The mutation function to execute
 * @param {Object} options - Configuration options
 * @param {Object} options.variables - Variables to pass to the mutation
 * @param {string} options.successMessage - Message to display on success (optional)
 * @param {string} options.errorMessage - Default error message (optional)
 * @param {Function} options.onSuccess - Callback on success (optional)
 * @param {Function} options.onError - Callback on error (optional)
 * @param {boolean} options.showSuccessToast - Whether to show success toast (default: true)
 * @param {boolean} options.showErrorToast - Whether to show error toast (default: true)
 * @returns {Promise} - The mutation result on success, or error object on failure
 */
export const executeMutation = async (mutationFn, options) => {
    const {
        variables,
        successMessage = 'Operation completed successfully',
        errorMessage = 'Operation failed',
        onSuccess,
        onError,
        showSuccessToast = true,
        showErrorToast = true
    } = options;

    try {
        const result = await mutationFn({ variables });

        if (showSuccessToast) {
            toast.success(successMessage);
        }

        if (onSuccess) {
            onSuccess(result);
        }

        return result;
    } catch (error) {
        // Extract the readable error message
        let displayError = errorMessage;

        if (error.graphQLErrors?.length > 0) {
            // GraphQL specific errors (from the server)
            displayError = error.graphQLErrors[0].message;
        } else if (error.networkError) {
            // Network errors
            displayError = 'Network error. Please check your connection.';
        } else if (error.message) {
            // Other errors with message
            displayError = error.message;
        }

        if (showErrorToast) {
            toast.error(displayError);
        }

        if (onError) {
            onError(error, displayError);
        }

        console.error('Mutation error:', error);

        // Rethrow error for component-level handling if needed
        throw error;
    }
};

/**
 * Higher-order function that makes a mutation function error-handled by default
 * @param {Function} mutationFn - Original mutation function
 * @param {Object} defaultOptions - Default options to apply to all calls
 * @returns {Function} - Wrapped mutation function with error handling
 */
export const withErrorHandling = (mutationFn, defaultOptions = {}) => {
    return (options = {}) => {
        const mergedOptions = { ...defaultOptions, ...options };
        return executeMutation(mutationFn, mergedOptions);
    };
};