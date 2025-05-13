// src/pages/ServiceDashboard/ServiceDashboard.jsx
import { useState, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "react-toastify";
import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card/Card";
import Modal from "../../components/common/Modal/Modal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog/ConfirmationDialog";
import ExportButton from "../../components/common/ExportButton/ExportButton";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import "./ServiceDashboard.css";
import {
    ChartsContainer,
    FilterPanel,
    ServiceForm,
    ServiceStats,
    ServiceTable,
} from "./components";

// GraphQL Queries
const GET_SERVICES = gql`
    query GetServices {
        services {
            id
            serviceName
            estimateCost
            createDatetime
            updateDatetime
            serviceType {
                id
                name
            }
            projectServices {
                id
                amount
            }
        }
    }
`;

const GET_SERVICE_TYPES = gql`
    query GetServiceTypes {
        serviceTypes {
            id
            name
        }
    }
`;

// Mutations
const CREATE_SERVICE = gql`
    mutation CreateService($input: CreateServiceInput!) {
        createService(input: $input) {
            id
            serviceName
            estimateCost
            serviceType {
                id
                name
            }
        }
    }
`;

const UPDATE_SERVICE = gql`
    mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
        updateService(id: $id, input: $input) {
            id
            serviceName
            estimateCost
            serviceType {
                id
                name
            }
        }
    }
`;

const DELETE_SERVICE = gql`
    mutation DeleteService($id: ID!) {
        deleteService(id: $id)
    }
`;

export default function ServiceDashboard() {
    // State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [filters, setFilters] = useState({
        search: "",
        serviceType: "",
        costMin: "",
        costMax: "",
    });

    // Refs for export
    const statsRef = useRef(null);
    const chartsRef = useRef(null);
    const tableRef = useRef(null);

    // Queries
    const {
        data: servicesData,
        loading: servicesLoading,
        error: servicesError,
        refetch: refetchServices,
    } = useQuery(GET_SERVICES);

    const {
        data: serviceTypesData,
        loading: serviceTypesLoading,
    } = useQuery(GET_SERVICE_TYPES);

    // Mutations
    const [createService] = useMutation(CREATE_SERVICE);
    const [updateService] = useMutation(UPDATE_SERVICE);
    const [deleteService] = useMutation(DELETE_SERVICE);

    // Filtering
    const filteredServices = servicesData?.services
        ? servicesData.services.filter((service) => {
            const matchesSearch =
                !filters.search ||
                service.serviceName
                    .toLowerCase()
                    .includes(filters.search.toLowerCase());

            const matchesType =
                !filters.serviceType ||
                service.serviceType.id === filters.serviceType;

            const matchesMinCost =
                !filters.costMin ||
                service.estimateCost >= parseFloat(filters.costMin);

            const matchesMaxCost =
                !filters.costMax ||
                service.estimateCost <= parseFloat(filters.costMax);

            return matchesSearch && matchesType && matchesMinCost && matchesMaxCost;
        })
        : [];

    // Export functions
    const exportToExcel = async () => {
        try {
            setIsExporting(true);
            toast.info("Preparing Excel export...");

            // Prepare services data for Excel
            const servicesSheet = filteredServices.map(service => ({
                "Service Name": service.serviceName,
                "Service Type": service.serviceType?.name || "Unknown",
                "Estimated Cost": parseFloat(service.estimateCost).toFixed(2),
                "Usage Count": service.projectServices?.length || 0
            }));

            // Calculate statistics for stats sheet
            const stats = calculateServiceStats(filteredServices);
            const statsSheet = [
                { "Statistic": "Total Services", "Value": stats.totalServices.toString() },
                { "Statistic": "Service Types", "Value": stats.uniqueServiceTypes.toString() },
                { "Statistic": "Total Estimated Cost", "Value": formatCurrency(stats.totalCost) },
                { "Statistic": "Average Cost", "Value": formatCurrency(stats.averageCost) },
                { "Statistic": "Median Cost", "Value": formatCurrency(stats.medianCost) },
                { "Statistic": "Minimum Cost", "Value": formatCurrency(stats.minCost) },
                { "Statistic": "Maximum Cost", "Value": formatCurrency(stats.maxCost) }
            ];

            // Create workbook with multiple sheets
            const wb = XLSX.utils.book_new();
            const servicesWS = XLSX.utils.json_to_sheet(servicesSheet);
            const statsWS = XLSX.utils.json_to_sheet(statsSheet);

            // Add sheets to workbook
            XLSX.utils.book_append_sheet(wb, servicesWS, "Services");
            XLSX.utils.book_append_sheet(wb, statsWS, "Statistics");

            // Try to capture charts if they're shown
            if (showStats && chartsRef.current) {
                try {
                    // Wait for small delay to ensure charts are rendered
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Capture charts as image
                    const chartsCanvas = await html2canvas(chartsRef.current, {
                        scale: 2,
                        logging: false,
                        useCORS: true
                    });

                    // Convert to binary string
                    const imgBase64 = chartsCanvas.toDataURL('image/png');

                    // Create a worksheet for the chart
                    const wsCharts = XLSX.utils.aoa_to_sheet([
                        ["Service Dashboard Charts"],
                        ["Generated: " + new Date().toLocaleString()]
                    ]);

                    // Add the image to the worksheet
                    const imageId = wb.addImage({
                        base64: imgBase64,
                        name: "ServiceCharts"
                    });

                    XLSX.utils.sheet_add_image(wsCharts, imageId, {
                        from: { c: 1, r: 3 },  // Column B, Row 4
                        ext: { width: 800, height: 400 }
                    });

                    // Add charts sheet
                    XLSX.utils.book_append_sheet(wb, wsCharts, "Charts");
                } catch (chartError) {
                    console.warn("Could not add charts to Excel:", chartError);
                }
            }

            // Generate file name with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const fileName = `services_dashboard_${timestamp}.xlsx`;

            // Write and download
            XLSX.writeFile(wb, fileName);

            toast.success("Excel export completed successfully!");
        } catch (error) {
            console.error("Excel export error:", error);
            toast.error(`Excel export failed: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const exportToPdf = async () => {
        try {
            setIsExporting(true);
            toast.info("Preparing PDF export...");

            // Create a new PDF document
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            // Set title
            pdf.setFontSize(18);
            pdf.setTextColor(30, 41, 59); // #1e293b
            pdf.text("Service Dashboard Report", 15, 15);
            pdf.setFontSize(12);
            pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 22);

            // Add filter information
            pdf.setFontSize(11);
            pdf.setDrawColor(226, 232, 240); // #e2e8f0
            pdf.line(15, 25, 195, 25);
            pdf.text("Applied Filters:", 15, 30);

            const filterText = [
                `Search: ${filters.search || "None"}`,
                `Service Type: ${getServiceTypeName(filters.serviceType) || "All"}`,
                `Cost Range: ${filters.costMin ? `$${filters.costMin}` : "Min"} - ${filters.costMax ? `$${filters.costMax}` : "Max"}`
            ];

            filterText.forEach((text, index) => {
                pdf.text(`• ${text}`, 20, 36 + (index * 6));
            });

            let yPosition = 55;

            // Add statistics
            pdf.setFontSize(14);
            pdf.text("Services Statistics", 15, yPosition);
            yPosition += 8;

            const stats = calculateServiceStats(filteredServices);
            const statsItems = [
                { label: "Total Services", value: stats.totalServices },
                { label: "Service Types", value: stats.uniqueServiceTypes },
                { label: "Total Estimated Cost", value: formatCurrency(stats.totalCost) },
                { label: "Average Cost", value: formatCurrency(stats.averageCost) },
                { label: "Median Cost", value: formatCurrency(stats.medianCost) },
                { label: "Cost Range", value: `${formatCurrency(stats.minCost)} - ${formatCurrency(stats.maxCost)}` }
            ];

            // Create statistics table
            pdf.setFontSize(10);
            pdf.setDrawColor(226, 232, 240); // #e2e8f0

            statsItems.forEach((item, index) => {
                const rowY = yPosition + (index * 7);
                if (index % 2 === 0) {
                    pdf.setFillColor(248, 250, 252); // #f8fafc
                    pdf.rect(15, rowY - 4, 180, 7, 'F');
                }
                pdf.text(item.label, 20, rowY);
                pdf.text(String(item.value), 120, rowY);
            });

            yPosition += (statsItems.length * 7) + 10;

            // Capture charts if they're shown
            if (showStats && chartsRef.current) {
                try {
                    const chartsCanvas = await html2canvas(chartsRef.current, {
                        scale: 2,
                        logging: false,
                        useCORS: true
                    });

                    pdf.setFontSize(14);
                    pdf.text("Service Analytics", 15, yPosition);
                    yPosition += 8;

                    const chartsImgData = chartsCanvas.toDataURL('image/png');
                    const imgWidth = 180;
                    const imgHeight = (chartsCanvas.height * imgWidth) / chartsCanvas.width;

                    // Check if we need a new page for charts
                    if (yPosition + imgHeight > 280) {
                        pdf.addPage();
                        yPosition = 15;
                    }

                    pdf.addImage(chartsImgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
                    yPosition += imgHeight + 15;
                } catch (chartError) {
                    console.error("Error capturing charts:", chartError);
                    pdf.text("Error capturing charts", 15, yPosition);
                    yPosition += 10;
                }
            }

            // Add table of services
            pdf.addPage();
            pdf.setFontSize(14);
            pdf.text("Services List", 15, 15);

            // Create table header
            pdf.setFontSize(10);
            pdf.setFillColor(248, 250, 252); // #f8fafc
            pdf.rect(15, 20, 180, 8, 'F');
            pdf.setDrawColor(226, 232, 240); // #e2e8f0
            pdf.line(15, 28, 195, 28);

            const columns = [
                { header: "Service Name", x: 15, width: 60 },
                { header: "Service Type", x: 75, width: 40 },
                { header: "Est. Cost", x: 115, width: 30 },
                { header: "Usage", x: 145, width: 15 }
            ];

            // Add header
            columns.forEach(col => {
                pdf.text(col.header, col.x, 25);
            });

            // Add rows
            let rowY = 33;
            const limit = Math.min(filteredServices.length, 40); // Limit to avoid too large PDFs

            for (let i = 0; i < limit; i++) {
                const service = filteredServices[i];

                // Add new page if needed
                if (rowY > 270) {
                    pdf.addPage();
                    rowY = 20;
                }

                // Alternating row background
                if (i % 2 === 1) {
                    pdf.setFillColor(248, 250, 252); // #f8fafc
                    pdf.rect(15, rowY - 4, 180, 7, 'F');
                }

                // Add row data
                pdf.text(truncateText(service.serviceName, 28), columns[0].x, rowY);
                pdf.text(truncateText(service.serviceType?.name || "Unknown", 18), columns[1].x, rowY);
                pdf.text(`$${parseFloat(service.estimateCost).toFixed(2)}`, columns[2].x, rowY);
                pdf.text((service.projectServices?.length || 0).toString(), columns[3].x, rowY);

                rowY += 7;
            }

            // Add note if truncated
            if (filteredServices.length > limit) {
                pdf.setFontSize(10);
                pdf.setTextColor(100, 116, 139); // #64748b
                pdf.text(`* Showing ${limit} of ${filteredServices.length} services`, 15, rowY + 5);
            }

            // Generate file name with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const fileName = `services_dashboard_${timestamp}.pdf`;

            // Save the PDF
            pdf.save(fileName);
            toast.success("PDF export completed successfully!");
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error(`PDF export failed: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    // Helper functions for export
    const calculateServiceStats = (services) => {
        if (!services.length) {
            return {
                totalServices: 0,
                totalCost: 0,
                averageCost: 0,
                medianCost: 0,
                minCost: 0,
                maxCost: 0,
                uniqueServiceTypes: 0
            };
        }

        // Filter out services with no cost defined
        const servicesWithCost = services.filter(service => service.estimateCost !== null && service.estimateCost !== undefined);

        // Extract costs as numbers and sort them
        const costs = servicesWithCost.map(service => parseFloat(service.estimateCost)).sort((a, b) => a - b);

        // Calculate total cost
        const totalCost = costs.reduce((sum, cost) => sum + cost, 0);

        // Calculate average cost
        const averageCost = costs.length ? totalCost / costs.length : 0;

        // Calculate median cost
        let medianCost = 0;
        if (costs.length) {
            const middle = Math.floor(costs.length / 2);
            medianCost = costs.length % 2 === 0
                ? (costs[middle - 1] + costs[middle]) / 2
                : costs[middle];
        }

        // Find min and max costs
        const minCost = costs.length ? costs[0] : 0;
        const maxCost = costs.length ? costs[costs.length - 1] : 0;

        // Count unique service types
        const uniqueTypes = new Set(services.map(service => service.serviceType?.id).filter(Boolean));

        return {
            totalServices: services.length,
            totalCost,
            averageCost,
            medianCost,
            minCost,
            maxCost,
            uniqueServiceTypes: uniqueTypes.size
        };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const truncateText = (text, length) => {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    const getServiceTypeName = (typeId) => {
        if (!typeId || !serviceTypesData?.serviceTypes) return "";
        const type = serviceTypesData.serviceTypes.find(type => type.id === typeId);
        return type?.name || "";
    };

    // Handlers
    const handleAddService = () => {
        setEditingService(null);
        setIsFormOpen(true);
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setIsFormOpen(true);
    };

    const handleDeleteService = (service) => {
        setServiceToDelete(service);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteService({ variables: { id: serviceToDelete.id } });
            toast.success(`Service "${serviceToDelete.serviceName}" deleted successfully`);
            refetchServices();
        } catch (error) {
            toast.error(`Error deleting service: ${error.message}`);
        } finally {
            setIsDeleteDialogOpen(false);
            setServiceToDelete(null);
        }
    };

    const handleServiceSubmit = async (serviceData) => {
        try {
            if (editingService) {
                await updateService({
                    variables: {
                        id: editingService.id,
                        input: {
                            serviceName: serviceData.serviceName,
                            estimateCost: parseFloat(serviceData.estimateCost),
                            serviceTypeId: serviceData.serviceTypeId,
                        },
                    },
                });
                toast.success(`Service "${serviceData.serviceName}" updated successfully`);
            } else {
                await createService({
                    variables: {
                        input: {
                            serviceName: serviceData.serviceName,
                            estimateCost: parseFloat(serviceData.estimateCost),
                            serviceTypeId: serviceData.serviceTypeId,
                        },
                    },
                });
                toast.success(`Service "${serviceData.serviceName}" created successfully`);
            }

            refetchServices();
            setIsFormOpen(false);
        } catch (error) {
            toast.error(`Error saving service: ${error.message}`);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Loading / error
    if (servicesLoading || serviceTypesLoading) {
        return <div className="loading-message">Loading services data...</div>;
    }

    if (servicesError) {
        return <div className="error-message">Error loading services: {servicesError.message}</div>;
    }

    // Render
    return (
        <div className="service-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Service Dashboard</h1>
                </div>
                <div className="header-controls">
                    <ExportButton
                        onExportExcel={exportToExcel}
                        onExportPdf={exportToPdf}
                        isExporting={isExporting}
                    />
                    <Button variant="primary" onClick={handleAddService} icon="+">
                        Add Service
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowStats((prev) => !prev)}
                    >
                        {showStats ? "Hide Stats and Charts" : "Show Stats and Charts"}
                    </Button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* Stats and Charts */}
                {showStats && (
                    <div className="stats-and-charts">
                        <div ref={statsRef}>
                            <ServiceStats services={filteredServices} />
                        </div>
                        <div ref={chartsRef}>
                            <ChartsContainer
                                services={servicesData?.services || []}
                                filteredServices={filteredServices}
                            />
                        </div>
                    </div>
                )}

                {/* Filters Panel */}
                <FilterPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    serviceTypes={serviceTypesData?.serviceTypes || []}
                />

                {/* Services Table */}
                <Card className="services-table-card" ref={tableRef}>
                    <h2>Services</h2>
                    <ServiceTable
                        services={filteredServices}
                        onEdit={handleEditService}
                        onDelete={handleDeleteService}
                    />
                </Card>
            </div>

            {/* Modal: Create/Edit */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingService ? "Edit Service" : "Add Service"}
                size="medium"
            >
                <ServiceForm
                    service={editingService}
                    serviceTypes={serviceTypesData?.serviceTypes || []}
                    onSubmit={handleServiceSubmit}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Service"
                message={`Are you sure you want to delete the service "${serviceToDelete?.serviceName}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}