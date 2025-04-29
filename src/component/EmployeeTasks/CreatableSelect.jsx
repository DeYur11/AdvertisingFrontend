import { useState } from "react";
import { useMutation } from "@apollo/client";

export default function CreatableSelect({
                                            label,
                                            name,
                                            options,
                                            value,
                                            onChange,
                                            createMutation,
                                            refetchOptions
                                        }) {
    const [creatingNew, setCreatingNew] = useState(false);
    const [newName, setNewName] = useState("");
    const [createItem] = useMutation(createMutation);

    const handleSelectChange = (e) => {
        const selected = e.target.value;
        if (selected === "add_new") {
            setCreatingNew(true);
        } else {
            onChange(selected);
        }
    };

    const handleSaveNew = async () => {
        if (!newName.trim()) return;
        try {
            const { data: created } = await createItem({
                variables: {
                    input: { name: newName.trim() } // 🔥 ТРЕБА input
                },
            });
            if (created) {
                await refetchOptions();
                const createdId = Object.values(created)[0]?.id;
                onChange(createdId);
                setCreatingNew(false);
                setNewName("");
            }
        } catch (error) {
            console.error("❌ Помилка при створенні:", error.message);
        }
    };


    return (
        <div className="mb-2">
            <label className="form-label">{label}</label>

            {!creatingNew ? (
                <select
                    className="form-select"
                    name={name}
                    value={value}
                    onChange={handleSelectChange}
                    required
                >
                    <option value="">Оберіть</option>
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                    <option value="add_new">➕ Додати новий</option>
                </select>
            ) : (
                <div className="d-flex gap-2 mt-2">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={`Новий ${label.toLowerCase()}`}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={handleSaveNew}
                    >
                        💾
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                            setCreatingNew(false);
                            setNewName("");
                        }}
                    >
                        ✖
                    </button>
                </div>
            )}
        </div>
    );
}
