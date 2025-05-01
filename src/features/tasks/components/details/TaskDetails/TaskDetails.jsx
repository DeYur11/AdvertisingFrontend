import { useState } from "react";
import Badge from "../../../../../components/common/Badge/Badge";
import Button from "../../../../../components/common/Button/Button";
import Card from "../../../../../components/common/Card/Card";
import "./TaskDetails.css";

export default function TaskDetails({ data }) {
    const [activeTab, setActiveTab] = useState("info");

    // Mock materials data for preview (in real app this would come from query)
    const materials = [
        {
            id: 1,
            name: "Homepage Mockup",
            description: "High-fidelity mockup of the homepage design",
            status: { name: "In Review" },
            language: { name: "English" },
            keywords: [{ name: "design" }, { name: "homepage" }, { name: "mockup" }]
        },
        {
            id: 2,
            name: "Component Library Documentation",
            description: "Documentation for all UI components used in the project",
            status: { name: "Accepted" },
            language: { name: "English" },
            keywords: [{ name: "documentation" }, { name: "components" }]
        }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString();
    };

    // Determine status class
    const statusClass = data.taskStatus?.name?.toLowerCase() || "";

    // Determine priority display and class
    let priorityClass = "default";

    if (data.priority) {
        const priority = parseInt(data.priority);

        if (priority >= 8) {
            priorityClass = "priority-high";
        } else if (priority >= 4) {
            priorityClass = "priority-medium";
        } else {
            priorityClass = "priority-low";
        }
    }

    return (
        <div className="task-details">
            {/* Tabs */}
            <div className="task-tabs">
                <Button
                    variant={activeTab === "info" ? "primary" : "outline"}
                    size="small"
                    onClick={() => setActiveTab("info")}
                    className="tab-button"
                >
                    Information
                </Button>
                <Button
                    variant={activeTab === "materials" ? "primary" : "outline"}
                    size="small"
                    onClick={() => setActiveTab("materials")}
                    className="tab-button"
                >
                    Materials ({materials.length})
                </Button>
            </div>

            {/* Information tab */}
            {activeTab === "info" && (
                <div className="info-tab">
                    <Card className="info-card">
                        <div className="task-title-section">
                            <h2 className="task-name">{data.name}</h2>
                            <Badge
                                className={`status-badge status-${statusClass}`}
                                variant={
                                    statusClass === "completed" ? "success" :
                                        statusClass === "in progress" ? "primary" :
                                            statusClass === "pending" ? "danger" :
                                                "default"
                                }
                                size="medium"
                            >
                                {data.taskStatus?.name || "Unknown"}
                            </Badge>
                        </div>

                        {data.description && (
                            <div className="task-description">
                                <h3 className="section-title">Description</h3>
                                <div className="description-content">{data.description || "No description provided."}</div>
                            </div>
                        )}

                        <div className="task-details-grid">
                            <div className="details-col">
                                <h3 className="section-title">Task Details</h3>

                                <div className="detail-item">
                                    <div className="detail-label">Priority</div>
                                    <div className="detail-value">
                                        <Badge className={priorityClass}>
                                            {data.priority || "—"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">Value</div>
                                    <div className="detail-value cost">
                                        {data.value ? `$${data.value}` : "—"}
                                    </div>
                                </div>
                            </div>

                            <div className="details-col">
                                <h3 className="section-title">Dates</h3>

                                <div className="detail-item">
                                    <div className="detail-label">Start Date</div>
                                    <div className="detail-value">
                                        {formatDate(data.startDate)}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">Deadline</div>
                                    <div className="detail-value deadline">
                                        {formatDate(data.deadline)}
                                    </div>
                                </div>

                                {data.endDate && (
                                    <div className="detail-item">
                                        <div className="detail-label">End Date</div>
                                        <div className="detail-value">
                                            {formatDate(data.endDate)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Materials tab */}
            {activeTab === "materials" && (
                <div className="materials-tab">
                    <div className="materials-header">
                        <h3 className="section-title">Attached Materials</h3>
                        <Button
                            variant="primary"
                            size="small"
                            icon="+"
                            className="add-material-btn"
                        >
                            Add Material
                        </Button>
                    </div>

                    {materials.length > 0 ? (
                        <div className="materials-grid">
                            {materials.map((material) => (
                                <Card
                                    key={material.id}
                                    className="material-card"
                                    hoverable
                                >
                                    <div className="material-header">
                                        <div className="material-name">{material.name}</div>
                                        <div className="material-status">
                                            <Badge
                                                variant={
                                                    material.status?.name === "Accepted" ? "success" :
                                                        "default"
                                                }
                                                size="small"
                                            >
                                                {material.status?.name || "Unknown"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {material.description && (
                                        <div className="material-description">
                                            {material.description.length > 100
                                                ? `${material.description.substring(0, 100)}...`
                                                : material.description
                                            }
                                        </div>
                                    )}

                                    <div className="material-meta">
                                        {material.language?.name && (
                                            <Badge className="language-badge" size="small">
                                                {material.language.name}
                                            </Badge>
                                        )}

                                        {material.keywords && material.keywords.length > 0 && (
                                            <div className="keywords">
                                                {material.keywords.slice(0, 3).map(kw => (
                                                    <span key={kw.name} className="keyword">
                                                        #{kw.name}
                                                    </span>
                                                ))}
                                                {material.keywords.length > 3 && (
                                                    <span className="more-keywords">
                                                        +{material.keywords.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {material.status?.name !== "Accepted" && (
                                        <div className="material-actions">
                                            <Button
                                                variant="outline"
                                                size="small"
                                                icon="✏️"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="small"
                                                icon="🗑"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="empty-state-card">
                            <div className="no-materials">
                                <div className="empty-icon">📄</div>
                                <div className="empty-message">No materials attached to this task yet</div>
                                <Button variant="primary">
                                    Add First Material
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}