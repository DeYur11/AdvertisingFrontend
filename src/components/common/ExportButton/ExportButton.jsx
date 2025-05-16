// src/components/common/ExportButton/ExportButton.jsx
import { useState } from "react";
import Button from "../Button/Button";
import "./ExportButton.css";

/**
 * ExportButton component for exporting dashboard data
 * @param {Object} props
 * @param {Function} props.onExportExcel - Callback for Excel export
 * @param {Function} props.onExportPdf - Callback for PDF export
 * @param {boolean} props.isExporting - Export in progress state
 */
export default function ExportButton({ onExportExcel, onExportPdf, isExporting = false }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleToggle = () => {
        setShowDropdown(!showDropdown);
    };

    const handleExportExcel = () => {
        setShowDropdown(false);
        onExportExcel();
    };

    const handleExportPdf = () => {
        setShowDropdown(false);
        onExportPdf();
    };

    return (
        <div className="export-button-container">
            <Button
                variant="primary"
                onClick={handleToggle}
                disabled={isExporting}
                className="export-button"
            >
                {isExporting ? "Експортуємо..." : "Експорт"}
                <span className="dropdown-icon">{showDropdown ? "▲" : "▼"}</span>
            </Button>

            {showDropdown && (
                <div className="export-dropdown">
                    <button className="export-option" onClick={handleExportExcel}>
                        <span className="export-icon">📊</span>
                        Експортувати в Excel
                    </button>
                    <button className="export-option" onClick={handleExportPdf}>
                        <span className="export-icon">📄</span>
                        Експортувати в PDF
                    </button>
                </div>
            )}
        </div>
    );
}
