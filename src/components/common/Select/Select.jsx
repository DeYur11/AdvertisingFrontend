import { useState, useEffect, useRef } from "react";
import "./Select.css";

export default function Select({
                                   options = [],
                                   value,
                                   onChange,
                                   isMulti = false,
                                   getOptionLabel = option => option.label || option.name || option,
                                   getOptionValue = option => option.value || option.id || option,
                                   placeholder = "Select...",
                                   disabled = false,
                                   className = "",
                                   ...props
                               }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const selectRef = useRef(null);
    const inputRef = useRef(null);

    // Handle outside click to close the select
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Toggle select dropdown
    const toggleSelect = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm("");
        }
    };

    // Check if an option is selected
    const isOptionSelected = (option) => {
        if (isMulti && Array.isArray(value)) {
            return value.some(item => getOptionValue(item) === getOptionValue(option));
        }
        return value && getOptionValue(value) === getOptionValue(option);
    };

    // Handle option selection
    const handleSelect = (option) => {
        if (isMulti) {
            let newValue;
            if (Array.isArray(value)) {
                if (isOptionSelected(option)) {
                    newValue = value.filter(item => getOptionValue(item) !== getOptionValue(option));
                } else {
                    newValue = [...value, option];
                }
            } else {
                newValue = [option];
            }
            onChange(newValue);
        } else {
            onChange(option);
            setIsOpen(false);
        }

        if (!isMulti) {
            setSearchTerm("");
        }
    };

    // Remove selected option (for multi-select)
    const removeOption = (option, e) => {
        e.stopPropagation();
        if (isMulti && Array.isArray(value)) {
            const newValue = value.filter(item => getOptionValue(item) !== getOptionValue(option));
            onChange(newValue);
        }
    };

    // Clear all selected options
    const clearAll = (e) => {
        e.stopPropagation();
        onChange(isMulti ? [] : null);
    };

    // Filter options based on search term
    const filteredOptions = searchTerm
        ? options.filter(option => getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    // Display value in select
    const renderValue = () => {
        if (isMulti) {
            if (Array.isArray(value) && value.length > 0) {
                return (
                    <div className="selected-options">
                        {value.map(option => (
                            <div key={getOptionValue(option)} className="selected-option">
                                <span className="option-label">{getOptionLabel(option)}</span>
                                <button
                                    type="button"
                                    className="remove-option"
                                    onClick={(e) => removeOption(option, e)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                );
            }
            return <span className="placeholder">{placeholder}</span>;
        }

        if (value) {
            return <span className="single-value">{getOptionLabel(value)}</span>;
        }

        return <span className="placeholder">{placeholder}</span>;
    };

    return (
        <div className={`select-container ${className} ${disabled ? "disabled" : ""}`} ref={selectRef}>
            <div className="select-control" onClick={toggleSelect}>
                <div className="select-value">
                    {renderValue()}
                </div>

                {(isMulti && Array.isArray(value) && value.length > 0) || (!isMulti && value) ? (
                    <button
                        type="button"
                        className="clear-selector"
                        onClick={clearAll}
                    >
                        ×
                    </button>
                ) : null}

                <div className="select-arrow">
                    {isOpen ? "▲" : "▼"}
                </div>
            </div>

            {isOpen && (
                <div className="select-dropdown">
                    <div className="search-container">
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div
                                    key={getOptionValue(option)}
                                    className={`option ${isOptionSelected(option) ? "selected" : ""}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {isMulti && (
                                        <div className="checkbox">
                                            {isOptionSelected(option) && <span className="checkmark">✓</span>}
                                        </div>
                                    )}
                                    <div className="option-label">{getOptionLabel(option)}</div>
                                </div>
                            ))
                        ) : (
                            <div className="no-options">No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}