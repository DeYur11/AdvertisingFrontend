// src/pages/EmployeeManagement/components/AccountForm/AccountForm.jsx
import { useState, useEffect } from "react";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import "./AccountForm.css";

export default function AccountForm({
                                        isOpen,
                                        onClose,
                                        onSave,
                                        account = null,
                                        employee = null,
                                        onDeleteAccount
                                    }) {
    const [formData, setFormData] = useState({
        id: "",
        username: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Initialize form data when account prop changes
    useEffect(() => {
        if (account) {
            setFormData({
                id: account.id || "",
                username: account.username || "",
                password: "",
                confirmPassword: ""
            });
        } else {
            // Reset form for new account
            setFormData({
                id: "",
                username: "",
                password: "",
                confirmPassword: ""
            });
        }
        // Clear errors when form resets
        setErrors({});
    }, [account]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 4) {
            newErrors.username = "Username must be at least 4 characters";
        }

        // Password validation for new accounts or password changes
        if (!account) {
            // New account requires password
            if (!formData.password) {
                newErrors.password = "Password is required";
            } else if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        } else if (formData.password) {
            // Existing account with password change
            if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
        }
    };

    const modalTitle = account
        ? `Edit Account for ${employee?.name} ${employee?.surname}`
        : `Create Account for ${employee?.name} ${employee?.surname}`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="medium"
        >
            <div className="account-form-container">
                {account ? (
                    <div className="account-status">
                        <div className="account-badge">Account Active</div>
                    </div>
                ) : (
                    <div className="no-account-message">
                        This employee does not have an account yet.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="account-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`form-control ${errors.username ? 'has-error' : ''}`}
                            placeholder="Enter username"
                        />
                        {errors.username && <div className="error-message">{errors.username}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {account ? "New Password (leave blank to keep current)" : "Password"}
                        </label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`form-control ${errors.password ? 'has-error' : ''}`}
                                placeholder={account ? "Enter new password" : "Enter password"}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-control ${errors.confirmPassword ? 'has-error' : ''}`}
                            placeholder="Confirm password"
                        />
                        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                    </div>

                    <div className="password-requirements">
                        <div className="requirements-title">Password Requirements:</div>
                        <ul className="requirements-list">
                            <li>Minimum 8 characters</li>
                            <li>Include both uppercase and lowercase letters</li>
                            <li>Include at least one number</li>
                            <li>Include at least one special character</li>
                        </ul>
                    </div>

                    <div className="form-actions">
                        {account && (
                            <Button
                                variant="danger"
                                type="button"
                                onClick={onDeleteAccount}
                                className="delete-account-btn"
                            >
                                Delete Account
                            </Button>
                        )}
                        <div className="right-actions">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                            >
                                {account ? "Update Account" : "Create Account"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}