// src/components/common/DetailView/DetailView.jsx
import { useState } from 'react';
import Card from '../Card/Card';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import './DetailView.css';

/**
 * DetailView component for displaying entity details in a modal or inline
 *
 * @param {Object} props
 * @param {Object} props.data - The data object to display
 * @param {Object[]} props.sections - Sections configuration
 * @param {string} props.sections[].title - Section title
 * @param {Object[]} props.sections[].fields - Fields to display in the section
 * @param {string} props.sections[].fields[].label - Field label
 * @param {string} props.sections[].fields[].key - Key to access data
 * @param {function} props.sections[].fields[].render - Optional custom render function
 * @param {Object[]} [props.actions] - Action buttons configuration
 * @param {function} props.onClose - Callback when modal is closed
 * @param {boolean} [props.isModal=true] - Whether to display as modal or inline
 * @param {string} [props.title] - Title for the modal
 * @param {string} [props.className] - Additional CSS class
 */
export default function DetailView({
                                       data,
                                       sections,
                                       actions,
                                       onClose,
                                       isModal = true,
                                       title = "Details",
                                       className = "",
                                   }) {
    const [activeTab, setActiveTab] = useState(0);

    // Render a field value with proper fallback for undefined values
    const renderFieldValue = (field, data) => {
        // If there's a custom render function, use it
        if (field.render) {
            return field.render(data);
        }

        // Handle nested paths (e.g. "task.name")
        if (field.key.includes('.')) {
            const keys = field.key.split('.');
            let value = data;

            for (const key of keys) {
                if (value === undefined || value === null) {
                    return field.fallback || "—";
                }
                value = value[key];
            }

            return value || field.fallback || "—";
        }

        // Handle simple keys
        const value = data[field.key];

        if (value === undefined || value === null) {
            return field.fallback || "—";
        }

        return value;
    };

    const content = (
        <div className={`detail-view ${className}`}>
            {/* Tabs if multiple sections */}
            {sections.length > 1 && (
                <div className="detail-view-tabs">
                    {sections.map((section, index) => (
                        <Button
                            key={index}
                            variant={activeTab === index ? "primary" : "outline"}
                            size="small"
                            onClick={() => setActiveTab(index)}
                            className="detail-tab-button"
                        >
                            {section.title}
                        </Button>
                    ))}
                </div>
            )}

            {/* Active Section */}
            <div className="detail-view-section">
                {sections[activeTab].title && (
                    <div className="section-header">
                        <h3 className="section-title">{sections[activeTab].title}</h3>
                        {sections[activeTab].headerContent && (
                            <div className="section-header-content">
                                {sections[activeTab].headerContent(data)}
                            </div>
                        )}
                    </div>
                )}

                <div className="section-content">
                    {/* Description if exists */}
                    {sections[activeTab].description && (
                        <div className="detail-description">
                            {typeof sections[activeTab].description === 'function'
                                ? sections[activeTab].description(data)
                                : sections[activeTab].description}
                        </div>
                    )}

                    {/* Grid layout for fields */}
                    {sections[activeTab].fields && (
                        <div className={`detail-grid ${sections[activeTab].gridClassName || ''}`}>
                            {sections[activeTab].fields.map((field, fieldIndex) => (
                                <div key={fieldIndex} className={`detail-field ${field.className || ''}`}>
                                    <span className="detail-label">{field.label}:</span>
                                    <span className="detail-value">
                                        {renderFieldValue(field, data)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Custom content if exists */}
                    {sections[activeTab].content && (
                        <div className="detail-custom-content">
                            {sections[activeTab].content(data)}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            {actions && actions.length > 0 && (
                <div className="detail-view-actions">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant || "outline"}
                            size={action.size || "medium"}
                            onClick={() => action.onClick(data)}
                            icon={action.icon}
                            className={action.className}
                            disabled={action.disabled}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );

    // Return either as modal or standalone
    return isModal ? (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={title}
            size="large"
        >
            {content}
        </Modal>
    ) : (
        <Card className="standalone-detail-view">
            {content}
        </Card>
    );
}