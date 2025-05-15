// src/components/common/SelectWithCreate.jsx
import CreatableSelect from "react-select/creatable";
import { useMutation } from "@apollo/client";
import { executeMutation } from "../../utils/ErrorHandlingUtils";

export default function SelectWithCreate({
                                             label,
                                             options,
                                             value,
                                             onChange,
                                             createMutation,
                                             refetchOptions,
                                             disabled = false,
                                             className = "",
                                         }) {
    if (!createMutation) {
        console.warn(`⚠️ [SelectWithCreate] Не передано createMutation для поля "${label}"`);
    }

    if (!Array.isArray(options)) {
        console.warn(`⚠️ [SelectWithCreate] options не є масивом у полі "${label}". Поточне значення:`, options);
    }

    if (!refetchOptions) {
        console.warn(`⚠️ [SelectWithCreate] Не передано refetchOptions для поля "${label}"`);
    }

    const [createItem] = useMutation(createMutation);

    const handleChange = (selectedOption) => {
        onChange(selectedOption?.value || "");
    };

    const handleCreate = async (inputValue) => {
        if (!createItem || !createMutation) {
            console.error("❌ Створення неможливе: createMutation не передано або недійсне.");
            return;
        }

        try {
            const result = await executeMutation(createItem, {
                variables: { input: { name: inputValue } },
                successMessage: `Створено новий елемент: ${inputValue}`,
                errorMessage: `Помилка при створенні: ${inputValue}`,
                onSuccess: async (data) => {
                    if (typeof refetchOptions === "function") {
                        await refetchOptions();
                    } else {
                        console.warn("⚠️ refetchOptions не є функцією, пропущено оновлення списку.");
                    }

                    // Find the mutation result - this object will have different shapes
                    // depending on which mutation was used
                    const resultObj = data?.data ? Object.values(data.data)[0] : null;

                    if (resultObj?.id) {
                        onChange(resultObj.id);
                    }
                }
            });
        } catch (err) {
            // executeMutation already handles the error display
            console.error("Error in handleCreate:", err);
        }
    };

    const selectedOption = options?.find((opt) => opt.id === value);
    const formattedOptions = (options || []).map((opt) => ({
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
                value={selectedOption ? { value: selectedOption.id, label: selectedOption.name } : null}
                isDisabled={disabled}
            />
        </div>
    );
}