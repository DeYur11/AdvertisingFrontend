
import CreatableSelect from "react-select/creatable";
import { useMutation } from "@apollo/client";

export default function SelectWithCreate({
                                             label,
                                             options,
                                             value,
                                             onChange,
                                             createMutation,
                                             refetchOptions,
                                         }) {
    const [createItem] = useMutation(createMutation);

    const handleChange = (selectedOption) => {
        onChange(selectedOption?.value || "");
    };

    const handleCreate = async (inputValue) => {
        try {
            const { data: created } = await createItem({
                variables: { input: { name: inputValue } },
            });

            if (created) {
                await refetchOptions();
                const newId = Object.values(created)[0]?.id;
                onChange(newId);
            }
        } catch (error) {
            console.error("❌ Помилка при створенні:", error.message);
        }
    };

    const selectedOption = options.find((opt) => opt.id === value);
    const formattedOptions = options.map((opt) => ({
        value: opt.id,
        label: opt.name,
    }));

    return (
        <div className="mb-2">
            <label className="form-label">{label}</label>
            <CreatableSelect
                isClearable
                onChange={handleChange}
                onCreateOption={handleCreate}
                options={formattedOptions}
                value={selectedOption ? { value: selectedOption.id, label: selectedOption.name } : null}
            />
        </div>
    );
}
