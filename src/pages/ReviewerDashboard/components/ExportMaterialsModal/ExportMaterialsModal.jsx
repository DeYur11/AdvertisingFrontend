// src/pages/ReviewerDashboard/components/ExportMaterialsModal/ExportMaterialsModal.jsx
import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import "./ExportMaterialsModal.css";

// GraphQL query for getting materials with all necessary fields for export
const GET_MATERIALS_FOR_EXPORT = gql`
    query GetMaterialsForExport($input: PaginatedMaterialsInput!) {
        paginatedMaterials(input: $input) {
            content {
                id
                name
                description
                createDatetime
                materialType {
                    id
                    name
                }
                status {
                    id
                    name
                }
                language {
                    id
                    name
                }
                task {
                    id
                    name
                    priority
                    serviceInProgress {
                        projectService {
                            project {
                                id
                                name
                                client {
                                    name
                                }
                            }
                        }
                    }
                }
                keywords {
                    id
                    name
                }
                reviews {
                    id
                    comments
                    suggestedChange
                    createDatetime
                    reviewDate
                    materialSummary {
                        id
                        name
                    }
                    reviewer {
                        id
                        name
                        surname
                    }
                }
                licenceType {
                    id
                    name
                }
                usageRestriction {
                    id
                    name
                }
                targetAudience {
                    id
                    name
                }
            }
            pageInfo {
                totalElements
            }
        }
    }
`;

export default function ExportMaterialsModal({
                                                 isOpen,
                                                 onClose,
                                                 filters = {},
                                                 currentSortField,
                                                 currentSortDirection,
                                                 workerId,
                                                 filter

                                             }) {
    // State for export options
    const [exportFormat, setExportFormat] = useState("csv");
    const [selectedFields, setSelectedFields] = useState({
        materialName: true,
        materialDescription: false,
        materialType: true,
        status: true,
        language: true,
        createDatetime: true,
        licenceType: false,
        usageRestriction: false,
        targetAudience: false,
        keywords: false,
        taskName: true,
        projectName: true,
        clientName: false,
        reviewStatus: true,
        reviewComments: false,
        reviewerName: false
    });
    const [includeHeaders, setIncludeHeaders] = useState(true);
    const [isExporting, setIsExporting] = useState(false);


    // Query for materials
    const { loading, error, data } = useQuery(GET_MATERIALS_FOR_EXPORT, {
        variables: {
            input: {
                page: 0,
                size: 1000, // Limit to 1000 materials for export
                sortField: currentSortField,
                sortDirection: currentSortDirection,
                filter: filters
            }
        },
        skip: !isOpen,
        fetchPolicy: "network-only"
    });

    // Function to toggle all fields
    const toggleAllFields = (checked) => {
        const newState = {};
        Object.keys(selectedFields).forEach(key => {
            newState[key] = checked;
        });
        setSelectedFields(newState);
    };

    // Handle field selection
    const handleFieldChange = (field) => {
        setSelectedFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Export data
    const exportData = () => {
        if (!data || !data.paginatedMaterials || !data.paginatedMaterials.content) {
            alert("No materials available for export");
            return;
        }

        setIsExporting(true);

        try {
            const materials = data.paginatedMaterials.content;

            let result;
            if (exportFormat === "csv") {
                result = exportToCSV(materials);
            } else if (exportFormat === "json") {
                result = exportToJSON(materials);
            } else if (exportFormat === "excel") {
                result = exportToExcel(materials);
            }

            if (result) {
                // Create a download link
                const element = document.createElement("a");
                element.href = result.url;
                element.download = result.filename;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        } catch (err) {
            console.error("Error exporting data:", err);
            alert("Error during export. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    // Export to CSV
    const exportToCSV = (materials) => {
        const headers = [];
        if (selectedFields.materialName) headers.push("Material Name");
        if (selectedFields.materialDescription) headers.push("Description");
        if (selectedFields.materialType) headers.push("Material Type");
        if (selectedFields.status) headers.push("Status");
        if (selectedFields.language) headers.push("Language");
        if (selectedFields.licenceType) headers.push("Licence Type");
        if (selectedFields.usageRestriction) headers.push("Usage Restriction");
        if (selectedFields.targetAudience) headers.push("Target Audience");
        if (selectedFields.keywords) headers.push("Keywords");
        if (selectedFields.taskName) headers.push("Task");
        if (selectedFields.projectName) headers.push("Project");
        if (selectedFields.clientName) headers.push("Client");
        if (selectedFields.reviewStatus) headers.push("Review Status");
        if (selectedFields.reviewComments) headers.push("Review Comments");
        if (selectedFields.reviewerName) headers.push("Reviewer");

        let csvContent = includeHeaders ? `${headers.join(",")}\n` : "";

        materials.forEach(material => {
            // Find the review by the current reviewer if it exists
            const reviewByMe = material.reviews?.find(review =>
                review.reviewer?.id === workerId.toString()
            );

            // Get project and client info
            const project = material.task?.serviceInProgress?.projectService?.project;
            const projectName = project?.name || "";
            const clientName = project?.client?.name || "";

            // Format keywords as a comma-separated list
            const keywordsList = material.keywords?.map(k => k.name).join(", ") || "";

            const row = [];
            if (selectedFields.materialName) row.push(`"${material.name.replace(/"/g, '""')}"`);
            if (selectedFields.materialDescription) row.push(`"${(material.description || "").replace(/"/g, '""')}"`);
            if (selectedFields.materialType) row.push(`"${material.materialType?.name || ""}"`);
            if (selectedFields.status) row.push(`"${material.status?.name || ""}"`);
            if (selectedFields.language) row.push(`"${material.language?.name || ""}"`);
            if (selectedFields.createDatetime) row.push(material.createDatetime || "");
            if (selectedFields.licenceType) row.push(`"${material.licenceType?.name || ""}"`);
            if (selectedFields.usageRestriction) row.push(`"${material.usageRestriction?.name || ""}"`);
            if (selectedFields.targetAudience) row.push(`"${material.targetAudience?.name || ""}"`);
            if (selectedFields.keywords) row.push(`"${keywordsList}"`);
            if (selectedFields.taskName) row.push(`"${material.task?.name || ""}"`);
            if (selectedFields.projectName) row.push(`"${projectName.replace(/"/g, '""')}"`);
            if (selectedFields.clientName) row.push(`"${clientName.replace(/"/g, '""')}"`);
            if (selectedFields.reviewStatus) {
                const reviewStatus = reviewByMe ? "Reviewed" : "Not Reviewed";
                row.push(`"${reviewStatus}"`);
            }
            if (selectedFields.reviewComments) row.push(`"${(reviewByMe?.comments || "").replace(/"/g, '""')}"`);
            if (selectedFields.reviewerName) {
                const reviewerName = reviewByMe?.reviewer
                    ? `${reviewByMe.reviewer.name} ${reviewByMe.reviewer.surname}`
                    : "";
                row.push(`"${reviewerName.replace(/"/g, '""')}"`);
            }

            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        return { url, filename: "materials_export.csv" };
    };

    // Export to JSON
    const exportToJSON = (materials) => {
        const formattedMaterials = materials.map(material => {
            // Find review by the current reviewer
            const reviewByMe = material.reviews?.find(review =>
                review.reviewer?.id === workerId.toString()
            );

            // Get project and client info
            const project = material.task?.serviceInProgress?.projectService?.project;

            const formattedMaterial = {};

            if (selectedFields.materialName) formattedMaterial.name = material.name;
            if (selectedFields.materialDescription) formattedMaterial.description = material.description;
            if (selectedFields.materialType) formattedMaterial.type = material.materialType?.name;
            if (selectedFields.status) formattedMaterial.status = material.status?.name;
            if (selectedFields.language) formattedMaterial.language = material.language?.name;
            if (selectedFields.createDatetime) formattedMaterial.createdDate = material.createDatetime;
            if (selectedFields.licenceType) formattedMaterial.licenceType = material.licenceType?.name;
            if (selectedFields.usageRestriction) formattedMaterial.usageRestriction = material.usageRestriction?.name;
            if (selectedFields.targetAudience) formattedMaterial.targetAudience = material.targetAudience?.name;

            if (selectedFields.keywords) {
                formattedMaterial.keywords = material.keywords?.map(k => k.name) || [];
            }

            if (selectedFields.taskName || selectedFields.projectName || selectedFields.clientName) {
                formattedMaterial.project = {};

                if (selectedFields.taskName)
                    formattedMaterial.project.task = material.task?.name;

                if (selectedFields.projectName)
                    formattedMaterial.project.name = project?.name;

                if (selectedFields.clientName)
                    formattedMaterial.project.client = project?.client?.name;
            }

            if (selectedFields.reviewStatus || selectedFields.reviewComments || selectedFields.reviewerName) {
                formattedMaterial.review = {};

                if (selectedFields.reviewStatus)
                    formattedMaterial.review.status = reviewByMe ? "Reviewed" : "Not Reviewed";

                if (selectedFields.reviewComments)
                    formattedMaterial.review.comments = reviewByMe?.comments;

                if (selectedFields.reviewerName && reviewByMe?.reviewer) {
                    formattedMaterial.review.reviewer =
                        `${reviewByMe.reviewer.name} ${reviewByMe.reviewer.surname}`;
                }
            }

            return formattedMaterial;
        });

        const jsonContent = JSON.stringify(formattedMaterials, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        return { url, filename: "materials_export.json" };
    };

    // Export to Excel (simplified as CSV with different extension)
    const exportToExcel = (materials) => {
        const csvExport = exportToCSV(materials);
        return { ...csvExport, filename: "materials_export.xlsx" };
    };

    const totalMaterials = data?.paginatedMaterials?.pageInfo?.totalElements || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Export Materials Data"
            size="medium"
        >
            <div className="export-modal-content">
                {loading ? (
                    <div className="export-loading">Loading materials data...</div>
                ) : error ? (
                    <div className="export-error">Error loading data: {error.message}</div>
                ) : (
                    <>

                            <p>Available for export: <strong>{totalMaterials}</strong> materials</p>

                        <div className="export-sections">
                            <div className="export-section">
                                <h3 className="export-section-title">Export Format</h3>
                                <div className="export-format-options">
                                    <label className="export-radio">
                                        <input
                                            type="radio"
                                            name="exportFormat"
                                            value="csv"
                                            checked={exportFormat === "csv"}
                                            onChange={() => setExportFormat("csv")}
                                        />
                                        <span className="radio-label">CSV</span>
                                    </label>
                                    <label className="export-radio">
                                        <input
                                            type="radio"
                                            name="exportFormat"
                                            value="json"
                                            checked={exportFormat === "json"}
                                            onChange={() => setExportFormat("json")}
                                        />
                                        <span className="radio-label">JSON</span>
                                    </label>
                                </div>
                            </div>

                            <div className="export-section">
                                <div className="export-section-header">
                                    <h3 className="export-section-title">Select Fields to Export</h3>
                                    <div className="export-select-all">
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => toggleAllFields(true)}
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => toggleAllFields(false)}
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </div>

                                <div className="export-fields-grid">
                                    <div className="export-field-column">
                                        <h4 className="export-column-title">Material Details</h4>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.materialName}
                                                onChange={() => handleFieldChange("materialName")}
                                            />
                                            <span>Material Name</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.materialDescription}
                                                onChange={() => handleFieldChange("materialDescription")}
                                            />
                                            <span>Description</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.materialType}
                                                onChange={() => handleFieldChange("materialType")}
                                            />
                                            <span>Material Type</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.status}
                                                onChange={() => handleFieldChange("status")}
                                            />
                                            <span>Status</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.language}
                                                onChange={() => handleFieldChange("language")}
                                            />
                                            <span>Language</span>
                                        </label>
                                    </div>

                                    <div className="export-field-column">
                                        <h4 className="export-column-title">Additional Details</h4>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.licenceType}
                                                onChange={() => handleFieldChange("licenceType")}
                                            />
                                            <span>Licence Type</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.usageRestriction}
                                                onChange={() => handleFieldChange("usageRestriction")}
                                            />
                                            <span>Usage Restriction</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.targetAudience}
                                                onChange={() => handleFieldChange("targetAudience")}
                                            />
                                            <span>Target Audience</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.keywords}
                                                onChange={() => handleFieldChange("keywords")}
                                            />
                                            <span>Keywords</span>
                                        </label>
                                    </div>

                                    <div className="export-field-column">
                                        <h4 className="export-column-title">Project Details</h4>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.taskName}
                                                onChange={() => handleFieldChange("taskName")}
                                            />
                                            <span>Task Name</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.projectName}
                                                onChange={() => handleFieldChange("projectName")}
                                            />
                                            <span>Project Name</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.clientName}
                                                onChange={() => handleFieldChange("clientName")}
                                            />
                                            <span>Client Name</span>
                                        </label>
                                    </div>

                                    <div className="export-field-column">
                                        <h4 className="export-column-title">Review Information</h4>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.reviewStatus}
                                                onChange={() => handleFieldChange("reviewStatus")}
                                            />
                                            <span>Review Status</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.reviewComments}
                                                onChange={() => handleFieldChange("reviewComments")}
                                            />
                                            <span>Review Comments</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.reviewerName}
                                                onChange={() => handleFieldChange("reviewerName")}
                                            />
                                            <span>Reviewer Name</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {exportFormat === "csv" && (
                                <div className="export-section">
                                    <h3 className="export-section-title">Additional Settings</h3>
                                    <label className="export-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={includeHeaders}
                                            onChange={() => setIncludeHeaders(!includeHeaders)}
                                        />
                                        <span>Include Column Headers</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="export-actions">
                            <Button
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                icon={isExporting ? "⏳" : "📊"}
                                onClick={exportData}
                                disabled={isExporting || !Object.values(selectedFields).some(v => v)}
                            >
                                {isExporting ? "Exporting..." : "Export Materials"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}