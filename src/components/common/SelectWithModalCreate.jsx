// SelectWithModalCreate.jsx
import CreatableSelect from "react-select/creatable";

export default function SelectWithModalCreate({
                                                  label,
                                                  options,
                                                  value,
                                                  onChange,
                                                  onCreateStart,
                                                  disabled = false,
                                                  className = "",
                                              }) {
    const handleChange = (selectedOption) => {
        onChange(selectedOption?.value || "");
    };

    const handleCreate = (inputValue) => {
        onCreateStart(inputValue);
    };

    const selectedOption = options?.find((opt) => opt.id === value);
    const formattedOptions = options.map((opt) => ({
        value: opt.id,
        label: opt.name,
    }));

    return (
        <div className={`mb-2 ${className}`}>
            <label className="form-label">{label}</label>
            <CreatableSelect
                isClearable
                onChange={handleChange}
                onCreateOption={handleCreate}
                options={formattedOptions}
                value={
                    selectedOption ? { value: selectedOption.id, label: selectedOption.name } : null
                }
                isDisabled={disabled}
            />
        </div>
    );
}