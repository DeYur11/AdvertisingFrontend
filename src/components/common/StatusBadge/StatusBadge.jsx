// Modify the StatusBadge.jsx component to handle the 'paused' status

import React from 'react';
import './StatusBadge.css';

/**
 * StatusBadge component for displaying status with visually appealing indicators
 *
 * @param {Object} props
 * @param {string} props.status - The status text to display
 * @param {string} props.type - Optional type for selecting specific styling (project, service, task)
 * @param {string} props.size - Optional size (small, medium, large)
 * @param {string} props.className - Optional additional CSS classes
 */
export default function StatusBadge({ status, type = 'default', size = 'medium', className = '' }) {
    // Normalize the status to handle different cases and spaces
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-') || 'unknown';

    // Determine the variant class based on the status
    let variant = '';

    if (normalizedStatus.includes('completed') ||
        normalizedStatus.includes('done') ||
        normalizedStatus.includes('finished')) {
        variant = 'success';
    } else if (normalizedStatus.includes('in-progress') ||
        normalizedStatus.includes('active') ||
        normalizedStatus.includes('ongoing')) {
        variant = 'primary';
    } else if (normalizedStatus.includes('pending') ||
        normalizedStatus.includes('scheduled') ||
        normalizedStatus.includes('planned')) {
        variant = 'warning';
    } else if (normalizedStatus.includes('paused') ||
        normalizedStatus.includes('on-hold')) {
        variant = 'paused'; // New variant for paused status
    } else if (normalizedStatus.includes('cancelled') ||
        normalizedStatus.includes('blocked')) {
        variant = 'danger';
    } else {
        variant = 'default';
    }

    return (
        <div className={`status-badge ${variant} ${type} ${size} ${className}`}>
            <span className="status-indicator"></span>
            <span className="status-text">{status}</span>
        </div>
    );
}