import {useEffect, useState} from "react";
import DatePicker from "react-datepicker";
import Button from "../Button/Button";

const MultiSelectFilter = ({ config, filters, refData, onChange }) => {
    const values = filters[config.key] || [];
    const options = config.optionsKey
        ? refData?.[config.optionsKey]?.map(item => ({
            value: item[config.optionValue],
            label: item[config.optionLabel]
        }))
        : config.options;

    const handleToggle = (value) => {
        const newValues = values.includes(value)
            ? values.filter(v => v !== value)
            : [...values, value];
        onChange(config.key, newValues);
    };

    return (
        <div className="filter-section">
            <h4>{config.label}</h4>
            <div className="multi-select-options">
                {options?.map(option => (
                    <div
                        key={option.value}
                        className={`multi-select-option ${values.includes(option.value) ? 'selected' : ''}`}
                        onClick={() => handleToggle(option.value)}
                    >
                        {option.label}
                        {values.includes(option.value) && <span className="checkmark">✓</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const DateRangeFilter = ({ config, filters, onChange }) => {
    const [startDate, setStartDate] = useState(filters[config.key]?.from || null);
    const [endDate, setEndDate] = useState(filters[config.key]?.to || null);

    useEffect(() => {
        onChange(config.key, { from: startDate, to: endDate });
    }, [startDate, endDate]);

    const handleQuickAction = (days) => {
        const today = new Date();
        if (days === 'overdue') {
            setStartDate(null);
            setEndDate(today);
        } else {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + days);
            setStartDate(today);
            setEndDate(targetDate);
        }
    };

    return (
        <div className="filter-section">
            <h4>{config.label}</h4>
            <div className="date-range-picker">
                <div className="date-inputs">
                    <div className="date-input">
                        <label>From:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            showMonthYearDropdown
                        />
                    </div>
                    <div className="date-input">
                        <label>To:</label>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            showMonthYearDropdown
                        />
                    </div>
                </div>
                <div className="quick-actions">
                    {config.quickActions?.map(action => (
                        <Button
                            key={action.label}
                            size="small"
                            variant="outline"
                            onClick={() => handleQuickAction(action.days)}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SearchableSelectFilter = ({
                                    config,
                                    refData,
                                    filters, // Додаємо filters до пропсів
                                    searchQuery,
                                    onSearch,
                                    onChange
                                }) => {
    const [localSearch, setLocalSearch] = useState(searchQuery || '');
    const options = refData?.[config.optionsKey]?.map(item => ({
        value: item[config.optionValue],
        label: item[config.optionLabel]
    })) || [];

    useEffect(() => {
        const timeout = setTimeout(() => onSearch(localSearch), 300);
        return () => clearTimeout(timeout);
    }, [localSearch]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(localSearch.toLowerCase())
    );

    // Отримуємо поточні значення з фільтрів
    const currentValues = filters[config.key] || [];

    const handleSelect = (value) => {
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onChange(config.key, newValues);
    };

    return (
        <div className="filter-section">
            <h4>{config.label}</h4>
            <div className="searchable-select">
                <input
                    type="text"
                    placeholder={`Search ${config.label}...`}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                />
                <div className="options-list">
                    {filteredOptions.map(option => (
                        <div
                            key={option.value}
                            className={`option-item ${
                                currentValues.includes(option.value) ? 'selected' : ''
                            }`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                            {currentValues.includes(option.value) && (
                                <span className="checkmark">✓</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FilterValueDisplay = ({ config, value, refData }) => {
    switch (config.type) {
        case 'multi-select':
            const options = config.optionsKey
                ? refData?.[config.optionsKey]?.map(item => ({
                    value: item[config.optionValue],
                    label: item[config.optionLabel]
                }))
                : config.options;

            return options
                ?.filter(opt => value.includes(opt.value))
                ?.map(opt => opt.label)
                ?.join(', ') || value.join(', ');

        case 'date-range':
            return `${value.from ? new Date(value.from).toLocaleDateString() : ''} - 
             ${value.to ? new Date(value.to).toLocaleDateString() : ''}`;

        case 'searchable-select':
            const selectedOptions = refData?.[config.optionsKey]
                ?.filter(item => value.includes(item[config.optionValue]))
                ?.map(item => item[config.optionLabel]);
            return selectedOptions?.join(', ') || '';

        default:
            return value.toString();
    }
};


export {
    MultiSelectFilter,
    DateRangeFilter,
    SearchableSelectFilter,
    FilterValueDisplay
};