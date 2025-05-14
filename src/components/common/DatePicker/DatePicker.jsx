import { useEffect, useRef, useState } from "react";
import "./DatePicker.css";

export default function DatePicker({
                                       selected,
                                       onChange,
                                       placeholderText = "Select date...",
                                       minDate,
                                       maxDate,
                                       disabled = false,
                                       className = "",
                                       ...props
                                   }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(selected ? new Date(selected) : new Date());
    const datePickerRef = useRef(null);

    // Функція для порівняння дат без врахування часу
    const compareDatesWithoutTime = (date1, date2, operator) => {
        const d1 = new Date(date1);
        d1.setHours(0, 0, 0, 0);
        const d2 = new Date(date2);
        d2.setHours(0, 0, 0, 0);

        if (operator === '<') return d1 < d2;
        if (operator === '<=') return d1 <= d2;
        if (operator === '>') return d1 > d2;
        if (operator === '>=') return d1 >= d2;
        if (operator === '===') return d1.getTime() === d2.getTime();

        return false;
    };

    // Функція для створення дати без врахування часу
    const createDateWithoutTime = (date) => {
        if (!date) return null;
        const newDate = new Date(date);
        newDate.setHours(12, 0, 0, 0); // Встановлюємо на полудень щоб уникнути проблем з часовими поясами
        return newDate;
    };

    // Format date as YYYY-MM-DD for input value
    const formatDateForInput = (date) => {
        if (!date) return "";
        const d = createDateWithoutTime(date);
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${d.getFullYear()}-${month}-${day}`;
    };

    // Format date for display
    const formatDateForDisplay = (date) => {
        if (!date) return "";
        const d = createDateWithoutTime(date);
        const options = { year: "numeric", month: "short", day: "numeric" };
        return d.toLocaleDateString(undefined, options);
    };

    // Handle outside click to close the datepicker
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get day of week the month starts on (0 = Sunday, 6 = Saturday)
    const getStartDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const startDay = getStartDayOfMonth(year, month);

        const days = [];

        // Add empty cells for days before the first of the month
        for (let i = 0; i < startDay; i++) {
            days.push({ day: "", isCurrentMonth: false });
        }

        // Add days of the current month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i, 12, 0, 0, 0); // Додаємо час 12:00:00
            const isSelected = selected && compareDatesWithoutTime(selected, date, '===');

            // Змінена умова для minDate - використовуємо '<' замість '<=' щоб включити мінімальну дату
            const isDisabled =
                (minDate && compareDatesWithoutTime(date, minDate, '<')) ||
                (maxDate && compareDatesWithoutTime(date, maxDate, '>'));

            days.push({
                day: i,
                isCurrentMonth: true,
                isSelected,
                isDisabled,
                date
            });
        }

        return days;
    };

    // Go to previous month
    const prevMonth = () => {
        setCurrentMonth(prev => {
            const prevMonth = new Date(prev);
            prevMonth.setMonth(prev.getMonth() - 1);
            return prevMonth;
        });
    };

    // Go to next month
    const nextMonth = () => {
        setCurrentMonth(prev => {
            const nextMonth = new Date(prev);
            nextMonth.setMonth(prev.getMonth() + 1);
            return nextMonth;
        });
    };

    // Handle date selection
    const handleDateSelect = (day) => {
        if (day.isDisabled || !day.isCurrentMonth) return;

        // Створюємо нову дату встановлюючи час на полудень
        const selectedDate = createDateWithoutTime(day.date);

        onChange(selectedDate);
        setIsOpen(false);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value) {
            const date = createDateWithoutTime(new Date(value));
            onChange(date);
            setCurrentMonth(date);
        } else {
            onChange(null);
        }
    };

    // Toggle the datepicker
    const toggleDatepicker = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    // Get month name
    const getMonthName = (month) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[month];
    };

    const days = generateCalendarDays();

    return (
        <div className={`datepicker-container ${className}`} ref={datePickerRef}>
            <div className="datepicker-input-container" onClick={toggleDatepicker}>
                <input
                    type="text"
                    className="form-control datepicker-input"
                    value={selected ? formatDateForDisplay(selected) : ""}
                    placeholder={placeholderText}
                    readOnly
                    disabled={disabled}
                    {...props}
                />
                <div className="datepicker-icon">
                    {isOpen ? "▲" : "▼"}
                </div>
            </div>

            {isOpen && (
                <div className="datepicker-calendar">
                    <div className="datepicker-header">
                        <button type="button" className="month-nav prev" onClick={prevMonth}>
                            &lt;
                        </button>
                        <div className="current-month">
                            {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
                        </div>
                        <button type="button" className="month-nav next" onClick={nextMonth}>
                            &gt;
                        </button>
                    </div>

                    <div className="datepicker-weekdays">
                        <div className="weekday">Su</div>
                        <div className="weekday">Mo</div>
                        <div className="weekday">Tu</div>
                        <div className="weekday">We</div>
                        <div className="weekday">Th</div>
                        <div className="weekday">Fr</div>
                        <div className="weekday">Sa</div>
                    </div>

                    <div className="datepicker-days">
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`day 
                                    ${!day.isCurrentMonth ? "not-current-month" : ""} 
                                    ${day.isSelected ? "selected" : ""} 
                                    ${day.isDisabled ? "disabled" : ""}`
                                }
                                onClick={() => day.day && !day.isDisabled ? handleDateSelect(day) : null}
                            >
                                {day.day}
                            </div>
                        ))}
                    </div>

                    <div className="datepicker-footer">
                        <button
                            type="button"
                            className="clear-date"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                                setIsOpen(false);
                            }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            className="today-date"
                            onClick={(e) => {
                                e.stopPropagation();
                                const today = createDateWithoutTime(new Date());
                                onChange(today);
                                setCurrentMonth(today);
                                setIsOpen(false);
                            }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}