// src/pages/ServiceTracker Page/components/ExportServiceModal/ExportServiceModal.jsx
import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import "./ExportServiceModal.css";

// GraphQL query for getting services data for export
const GET_SERVICES_FOR_EXPORT = gql`
    query GetServicesForExport($input: PaginatedProjectServicesInput!) {
        paginatedProjectServices(input: $input) {
            content {
                id
                amount
                service {
                    id
                    serviceName
                    estimateCost
                    serviceType {
                        id
                        name
                    }
                }
                project {
                    id
                    name
                    client {
                        id
                        name
                    }
                    status {
                        id
                        name
                    }
                    startDate
                    endDate
                    manager {
                        id
                        name
                        surname
                    }
                }
                servicesInProgress {
                    id
                    startDate
                    endDate
                    cost
                    status {
                        id
                        name
                    }
                    tasks {
                        id
                        name
                        taskStatus {
                            name
                        }
                    }
                }
            }
            pageInfo {
                totalElements
            }
        }
    }
`;

export default function ExportServiceModal({ isOpen, onClose, filters = {}, currentSortField, currentSortDirection }) {
    // Export format and options state
    const [exportFormat, setExportFormat] = useState("csv");
    const [selectedFields, setSelectedFields] = useState({
        // Service fields
        serviceName: true,
        serviceType: true,
        estimateCost: true,
        requiredCount: true,
        implementedCount: true,

        // Project fields
        projectName: true,
        projectStatus: true,
        clientName: true,
        projectManager: false,
        projectStartDate: false,
        projectEndDate: false,

        // Implementation fields
        implementationStatus: true,
        implementationStartDate: true,
        implementationEndDate: false,
        implementationCost: true,
        taskCount: false
    });
    const [includeHeaders, setIncludeHeaders] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Convert filters to GraphQL format
    const getGraphQLFilters = () => {
        const gqlFilters = {
            onlyMismatched: filters.onlyMismatched
        };

        if (filters.searchQuery) {
            gqlFilters.serviceNameContains = filters.searchQuery;
            gqlFilters.projectNameContains = filters.searchQuery;
        }

        if (filters.serviceTypeIds?.length > 0) {
            gqlFilters.serviceTypeIds = filters.serviceTypeIds;
        }

        if (filters.projectStatusIds?.length > 0) {
            gqlFilters.projectStatusIds = filters.projectStatusIds;
        }

        if (filters.projectTypeIds?.length > 0) {
            gqlFilters.projectTypeIds = filters.projectTypeIds;
        }

        if (filters.clientIds?.length > 0) {
            gqlFilters.clientIds = filters.clientIds;
        }

        if (filters.managerIds?.length > 0) {
            gqlFilters.managerIds = filters.managerIds;
        }

        if (filters.serviceInProgressStatusIds?.length > 0) {
            gqlFilters.serviceInProgressStatusIds = filters.serviceInProgressStatusIds;
        }

        // Date ranges
        if (filters.dateRange?.startDateFrom) {
            gqlFilters.startDateFrom = filters.dateRange.startDateFrom;
        }

        if (filters.dateRange?.startDateTo) {
            gqlFilters.startDateTo = filters.dateRange.startDateTo;
        }

        if (filters.dateRange?.endDateFrom) {
            gqlFilters.endDateFrom = filters.dateRange.endDateFrom;
        }

        if (filters.dateRange?.endDateTo) {
            gqlFilters.endDateTo = filters.dateRange.endDateTo;
        }

        // Cost ranges
        if (filters.costRange?.costMin) {
            gqlFilters.costMin = parseFloat(filters.costRange.costMin);
        }

        if (filters.costRange?.costMax) {
            gqlFilters.costMax = parseFloat(filters.costRange.costMax);
        }

        return gqlFilters;
    };

    // Query to fetch data for export
    const { loading, error, data } = useQuery(GET_SERVICES_FOR_EXPORT, {
        variables: {
            input: {
                page: 0,
                size: 1000, // Limit export to 1000 records
                sortField: currentSortField,
                sortDirection: currentSortDirection,
                filter: getGraphQLFilters()
            }
        },
        skip: !isOpen,
        fetchPolicy: "network-only"
    });

    // Toggle all fields at once
    const toggleAllFields = (checked) => {
        const newState = {};
        Object.keys(selectedFields).forEach(key => {
            newState[key] = checked;
        });
        setSelectedFields(newState);
    };

    // Handle field selection change
    const handleFieldChange = (field) => {
        setSelectedFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Export data function
    const exportData = () => {
        if (!data || !data.paginatedProjectServices || !data.paginatedProjectServices.content) {
            alert("No data available for export");
            return;
        }

        setIsExporting(true);

        try {
            const services = data.paginatedProjectServices.content;

            let result;
            if (exportFormat === "csv") {
                result = exportToCSV(services);
            } else if (exportFormat === "json") {
                result = exportToJSON(services);
            } else if (exportFormat === "excel") {
                result = exportToExcel(services);
            }

            if (result) {
                // Create download link
                const element = document.createElement("a");
                element.href = result.url;
                element.download = result.filename;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        } catch (err) {
            console.error("Error exporting data:", err);
            alert("An error occurred during export. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    // Export to CSV format
    const exportToCSV = (services) => {
        const headers = [];
        if (selectedFields.serviceName) headers.push("Service Name");
        if (selectedFields.serviceType) headers.push("Service Type");
        if (selectedFields.estimateCost) headers.push("Estimated Cost");
        if (selectedFields.requiredCount) headers.push("Required Count");
        if (selectedFields.implementedCount) headers.push("Implemented Count");
        if (selectedFields.projectName) headers.push("Project");
        if (selectedFields.projectStatus) headers.push("Project Status");
        if (selectedFields.clientName) headers.push("Client");
        if (selectedFields.projectManager) headers.push("Project Manager");
        if (selectedFields.projectStartDate) headers.push("Project Start Date");
        if (selectedFields.projectEndDate) headers.push("Project End Date");
        if (selectedFields.implementationStatus) headers.push("Implementation Status");
        if (selectedFields.implementationStartDate) headers.push("Implementation Start Date");
        if (selectedFields.implementationEndDate) headers.push("Implementation End Date");
        if (selectedFields.implementationCost) headers.push("Implementation Cost");
        if (selectedFields.taskCount) headers.push("Task Count");

        let csvContent = includeHeaders ? `${headers.join(",")}\n` : "";

        services.forEach(projectService => {
            const implementedCount = projectService.servicesInProgress?.length || 0;

            // For each service implementation, create a row
            // If there are no implementations yet, still create one row with basic service info
            if (implementedCount === 0) {
                const row = [];
                if (selectedFields.serviceName) row.push(`"${projectService.service.serviceName.replace(/"/g, '""')}"`);
                if (selectedFields.serviceType) row.push(`"${projectService.service.serviceType.name.replace(/"/g, '""')}"`);
                if (selectedFields.estimateCost) row.push(projectService.service.estimateCost || "");
                if (selectedFields.requiredCount) row.push(projectService.amount || "");
                if (selectedFields.implementedCount) row.push("0");
                if (selectedFields.projectName) row.push(`"${projectService.project.name.replace(/"/g, '""')}"`);
                if (selectedFields.projectStatus) row.push(`"${projectService.project.status?.name || ""}"`);
                if (selectedFields.clientName) row.push(`"${projectService.project.client.name.replace(/"/g, '""')}"`);
                if (selectedFields.projectManager) {
                    const manager = projectService.project.manager;
                    row.push(manager ? `"${manager.name} ${manager.surname}".replace(/"/g, '""')` : "");
                }
                if (selectedFields.projectStartDate) row.push(projectService.project.startDate || "");
                if (selectedFields.projectEndDate) row.push(projectService.project.endDate || "");
                if (selectedFields.implementationStatus) row.push("");
                if (selectedFields.implementationStartDate) row.push("");
                if (selectedFields.implementationEndDate) row.push("");
                if (selectedFields.implementationCost) row.push("");
                if (selectedFields.taskCount) row.push("0");

                csvContent += row.join(",") + "\n";
            } else {
                // For each implementation, create a separate row
                projectService.servicesInProgress.forEach(impl => {
                    const row = [];
                    if (selectedFields.serviceName) row.push(`"${projectService.service.serviceName.replace(/"/g, '""')}"`);
                    if (selectedFields.serviceType) row.push(`"${projectService.service.serviceType.name.replace(/"/g, '""')}"`);
                    if (selectedFields.estimateCost) row.push(projectService.service.estimateCost || "");
                    if (selectedFields.requiredCount) row.push(projectService.amount || "");
                    if (selectedFields.implementedCount) row.push(implementedCount);
                    if (selectedFields.projectName) row.push(`"${projectService.project.name.replace(/"/g, '""')}"`);
                    if (selectedFields.projectStatus) row.push(`"${projectService.project.status?.name || ""}"`);
                    if (selectedFields.clientName) row.push(`"${projectService.project.client.name.replace(/"/g, '""')}"`);
                    if (selectedFields.projectManager) {
                        const manager = projectService.project.manager;
                        row.push(manager ? `"${manager.name} ${manager.surname}".replace(/"/g, '""')` : "");
                    }
                    if (selectedFields.projectStartDate) row.push(projectService.project.startDate || "");
                    if (selectedFields.projectEndDate) row.push(projectService.project.endDate || "");
                    if (selectedFields.implementationStatus) row.push(`"${impl.status?.name || ""}"`);
                    if (selectedFields.implementationStartDate) row.push(impl.startDate || "");
                    if (selectedFields.implementationEndDate) row.push(impl.endDate || "");
                    if (selectedFields.implementationCost) row.push(impl.cost || "");
                    if (selectedFields.taskCount) row.push(impl.tasks?.length || "0");

                    csvContent += row.join(",") + "\n";
                });
            }
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        return { url, filename: "services_export.csv" };
    };

    // Export to JSON format
    const exportToJSON = (services) => {
        const formattedServices = services.map(projectService => {
            const formattedService = {};

            // Include only selected fields
            if (selectedFields.serviceName) formattedService.serviceName = projectService.service.serviceName;
            if (selectedFields.serviceType) formattedService.serviceType = projectService.service.serviceType.name;
            if (selectedFields.estimateCost) formattedService.estimatedCost = projectService.service.estimateCost;
            if (selectedFields.requiredCount) formattedService.requiredCount = projectService.amount;
            if (selectedFields.implementedCount) formattedService.implementedCount = projectService.servicesInProgress?.length || 0;

            if (selectedFields.projectName || selectedFields.projectStatus ||
                selectedFields.clientName || selectedFields.projectManager ||
                selectedFields.projectStartDate || selectedFields.projectEndDate) {

                formattedService.project = {};

                if (selectedFields.projectName) formattedService.project.name = projectService.project.name;
                if (selectedFields.projectStatus) formattedService.project.status = projectService.project.status?.name;
                if (selectedFields.clientName) formattedService.project.client = projectService.project.client.name;

                if (selectedFields.projectManager) {
                    const manager = projectService.project.manager;
                    formattedService.project.manager = manager ? `${manager.name} ${manager.surname}` : null;
                }

                if (selectedFields.projectStartDate) formattedService.project.startDate = projectService.project.startDate;
                if (selectedFields.projectEndDate) formattedService.project.endDate = projectService.project.endDate;
            }

            if (selectedFields.implementationStatus || selectedFields.implementationStartDate ||
                selectedFields.implementationEndDate || selectedFields.implementationCost ||
                selectedFields.taskCount) {

                formattedService.implementations = projectService.servicesInProgress.map(impl => {
                    const implementation = {};

                    if (selectedFields.implementationStatus) implementation.status = impl.status?.name;
                    if (selectedFields.implementationStartDate) implementation.startDate = impl.startDate;
                    if (selectedFields.implementationEndDate) implementation.endDate = impl.endDate;
                    if (selectedFields.implementationCost) implementation.cost = impl.cost;
                    if (selectedFields.taskCount) implementation.taskCount = impl.tasks?.length || 0;

                    return implementation;
                });
            }

            return formattedService;
        });

        const jsonContent = JSON.stringify(formattedServices, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        return { url, filename: "services_export.json" };
    };

    // Export to Excel (simplified as CSV with different extension for demo)
    const exportToExcel = (services) => {
        const csvExport = exportToCSV(services);
        return { ...csvExport, filename: "services_export.xlsx" };
    };

    const totalServices = data?.paginatedProjectServices?.pageInfo?.totalElements || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Export Service Data"
            size="medium"
        >
            <div className="export-modal-content">
                {loading ? (
                    <div className="export-loading">Loading data...</div>
                ) : error ? (
                    <div className="export-error">Error loading data: {error.message}</div>
                ) : (
                    <>
                        <Card className="export-info">
                            <p>Available for export: <strong>{totalServices}</strong> services</p>
                        </Card>

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
                                        <h4 className="export-column-title">Service Info</h4>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.serviceName}
                                                onChange={() => handleFieldChange("serviceName")}
                                            />
                                            <span>Service Name</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.serviceType}
                                                onChange={() => handleFieldChange("serviceType")}
                                            />
                                            <span>Service Type</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.estimateCost}
                                                onChange={() => handleFieldChange("estimateCost")}
                                            />
                                            <span>Estimated Cost</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.requiredCount}
                                                onChange={() => handleFieldChange("requiredCount")}
                                            />
                                            <span>Required Count</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.implementedCount}
                                                onChange={() => handleFieldChange("implementedCount")}
                                            />
                                            <span>Implemented Count</span>
                                        </label>
                                    </div>

                                    <div className="export-field-column">
                                        <h4 className="export-column-title">Project Info</h4>
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
                                                checked={selectedFields.projectStatus}
                                                onChange={() => handleFieldChange("projectStatus")}
                                            />
                                            <span>Project Status</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.clientName}
                                                onChange={() => handleFieldChange("clientName")}
                                            />
                                            <span>Client</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.projectManager}
                                                onChange={() => handleFieldChange("projectManager")}
                                            />
                                            <span>Project Manager</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.projectStartDate}
                                                onChange={() => handleFieldChange("projectStartDate")}
                                            />
                                            <span>Project Start Date</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.projectEndDate}
                                                onChange={() => handleFieldChange("projectEndDate")}
                                            />
                                            <span>Project End Date</span>
                                        </label>
                                    </div>

                                    <div className="export-field-column">
                                        <h4 className="export-column-title">Implementation Info</h4>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.implementationStatus}
                                                onChange={() => handleFieldChange("implementationStatus")}
                                            />
                                            <span>Implementation Status</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.implementationStartDate}
                                                onChange={() => handleFieldChange("implementationStartDate")}
                                            />
                                            <span>Start Date</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.implementationEndDate}
                                                onChange={() => handleFieldChange("implementationEndDate")}
                                            />
                                            <span>End Date</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.implementationCost}
                                                onChange={() => handleFieldChange("implementationCost")}
                                            />
                                            <span>Actual Cost</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.taskCount}
                                                onChange={() => handleFieldChange("taskCount")}
                                            />
                                            <span>Task Count</span>
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
                                        <span>Include column headers</span>
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
                                {isExporting ? "Exporting..." : "Export Data"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}