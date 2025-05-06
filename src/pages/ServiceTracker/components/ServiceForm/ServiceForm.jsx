// src/pages/ServiceTracker/components/ServiceForm/ServiceForm.jsx
import "./ServiceForm.css";

export default function ServiceForm({
                                        serviceForm,
                                        onChange,
                                        projectService
                                        // statuses більше не потрібен
                                    }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...serviceForm, [name]: value });
    };

    return (
        <div className="form-section">
            <h3 className="section-title">Деталі реалізації сервісу</h3>

            <div className="form-grid">
                {/* Сервіс */}
                <div className="form-group">
                    <label className="form-label">Сервіс</label>
                    <input
                        type="text"
                        className="form-control"
                        value={projectService?.service?.serviceName || ""}
                        disabled
                    />
                </div>

                {/* Проєкт */}
                <div className="form-group">
                    <label className="form-label">Проєкт</label>
                    <input
                        type="text"
                        className="form-control"
                        value={projectService?.project?.name || ""}
                        disabled
                    />
                </div>

                {/* Дата початку (обовʼязково) */}
                <div className="form-group">
                    <label className="form-label">Дата початку *</label>
                    <input
                        type="date"
                        name="startDate"
                        value={serviceForm.startDate}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                {/* /TODO Зробити щоб завдання відкривались */}
                {/* Вартість (необовʼязково) */}
                <div className="form-group">
                    <label className="form-label">Вартість</label>
                    <input
                        type="number"
                        name="cost"
                        value={serviceForm.cost}
                        onChange={handleChange}
                        className="form-control"
                        step="0.01"
                        placeholder="Введіть вартість…"
                    />
                </div>
            </div>
        </div>
    );
}
