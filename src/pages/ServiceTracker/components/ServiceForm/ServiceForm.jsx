// src/pages/ServiceTracker/components/ServiceForm/ServiceForm.jsx
import "./ServiceForm.css";

export default function ServiceForm({ serviceForm, onChange, projectService, statuses }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...serviceForm, [name]: value });
    };

    return (
        <div className="form-section">
            <h3 className="section-title">Service Implementation Details</h3>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Service</label>
                    <input
                        type="text"
                        className="form-control"
                        value={projectService?.service?.serviceName || ""}
                        disabled
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Project</label>
                    <input
                        type="text"
                        className="form-control"
                        value={projectService?.project?.name || ""}
                        disabled
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select
                        name="statusId"
                        value={serviceForm.statusId}
                        onChange={handleChange}
                        className="form-control"
                        required
                    >
                        <option value="">Select status</option>
                        {statuses.map(status => (
                            <option key={status.id} value={status.id}>
                                {status.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                        type="date"
                        name="startDate"
                        value={serviceForm.startDate}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={serviceForm.endDate}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Cost</label>
                    <input
                        type="number"
                        name="cost"
                        value={serviceForm.cost}
                        onChange={handleChange}
                        className="form-control"
                        step="0.01"
                        placeholder="Enter cost..."
                    />
                </div>
            </div>
        </div>
    );
}