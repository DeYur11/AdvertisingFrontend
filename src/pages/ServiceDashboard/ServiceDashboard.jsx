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
            toast.info("Готуємо експорт у Excel...");

            // Prepare services data for Excel
            const servicesSheet = filteredServices.map(service => ({
                "Назва послуги": service.serviceName,
                "Тип послуги": service.serviceType?.name || "Невідомо",
                "Оціночна вартість": parseFloat(service.estimateCost).toFixed(2),
                "Кількість використань": service.projectServices?.length || 0
            }));

            // Calculate statistics for stats sheet
            const stats = calculateServiceStats(filteredServices);
            const statsSheet = [
                { "Статистика": "Всього послуг", "Значення": stats.totalServices.toString() },
                { "Статистика": "Кількість типів", "Значення": stats.uniqueServiceTypes.toString() },
                { "Статистика": "Сумарна вартість", "Значення": formatCurrency(stats.totalCost) },
                { "Статистика": "Середня вартість", "Значення": formatCurrency(stats.averageCost) },
                { "Статистика": "Медіанна вартість", "Значення": formatCurrency(stats.medianCost) },
                { "Статистика": "Мінімальна вартість", "Значення": formatCurrency(stats.minCost) },
                { "Статистика": "Максимальна вартість", "Значення": formatCurrency(stats.maxCost) }
            ];

            // Create workbook with multiple sheets
            const wb = XLSX.utils.book_new();
            const servicesWS = XLSX.utils.json_to_sheet(servicesSheet);
            const statsWS = XLSX.utils.json_to_sheet(statsSheet);

            // Add sheets to workbook
            XLSX.utils.book_append_sheet(wb, servicesWS, "Послуги");
            XLSX.utils.book_append_sheet(wb, statsWS, "Статистика");

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
                        ["Аналітика по послугах"],
                        ["Згенеровано: " + new Date().toLocaleString()]
                    ]);

                    // Додаємо картинку до аркуша — тут залежить від бібліотеки, це може не підтримуватися напряму
                    // Тому залишаємо як текстову закладку для зручності

                    XLSX.utils.book_append_sheet(wb, wsCharts, "Графіки");
                } catch (chartError) {
                    console.warn("Не вдалося додати графіки до Excel:", chartError);
                }
            }

            // Generate file name with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const fileName = `звіт_послуги_${timestamp}.xlsx`;

            // Write and download
            XLSX.writeFile(wb, fileName);

            toast.success("Експорт до Excel виконано успішно!");
        } catch (error) {
            console.error("Excel export error:", error);
            toast.error(`Помилка експорту: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const exportToPdf = async () => {
        try {
            setIsExporting(true);
            toast.info("Готуємо PDF-звіт...");

            // Create a new PDF document
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            // Set title
            pdf.setFontSize(18);
            pdf.setTextColor(30, 41, 59); // #1e293b
            pdf.text("Звіт по послугах", 15, 15);
            pdf.setFontSize(12);
            pdf.text(`Згенеровано: ${new Date().toLocaleString()}`, 15, 22);

            // Add filter information
            pdf.setFontSize(11);
            pdf.setDrawColor(226, 232, 240); // #e2e8f0
            pdf.line(15, 25, 195, 25);
            pdf.text("Застосовані фільтри:", 15, 30);

            const filterText = [
                `Пошук: ${filters.search || "—"}`,
                `Тип послуги: ${getServiceTypeName(filters.serviceType) || "Усі"}`,
                `Діапазон вартості: ${filters.costMin ? `${filters.costMin}₴` : "Мін"} - ${filters.costMax ? `${filters.costMax}₴` : "Макс"}`
            ];

            filterText.forEach((text, index) => {
                pdf.text(`• ${text}`, 20, 36 + (index * 6));
            });

            let yPosition = 55;

            // Add statistics
            pdf.setFontSize(14);
            pdf.text("Статистика по послугах", 15, yPosition);
            yPosition += 8;

            const stats = calculateServiceStats(filteredServices);
            const statsItems = [
                { label: "Всього послуг", value: stats.totalServices },
                { label: "Кількість типів", value: stats.uniqueServiceTypes },
                { label: "Сумарна вартість", value: formatCurrency(stats.totalCost) },
                { label: "Середня вартість", value: formatCurrency(stats.averageCost) },
                { label: "Медіанна вартість", value: formatCurrency(stats.medianCost) },
                { label: "Діапазон вартості", value: `${formatCurrency(stats.minCost)} - ${formatCurrency(stats.maxCost)}` }
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
                    pdf.text("Графіки", 15, yPosition);
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
                    pdf.text("Не вдалося додати графіки", 15, yPosition);
                    yPosition += 10;
                }
            }

            // Add table of services
            pdf.addPage();
            pdf.setFontSize(14);
            pdf.text("Список послуг", 15, 15);

            // Create table header
            pdf.setFontSize(10);
            pdf.setFillColor(248, 250, 252); // #f8fafc
            pdf.rect(15, 20, 180, 8, 'F');
            pdf.setDrawColor(226, 232, 240); // #e2e8f0
            pdf.line(15, 28, 195, 28);

            const columns = [
                { header: "Назва послуги", x: 15, width: 60 },
                { header: "Тип послуги", x: 75, width: 40 },
                { header: "Вартість", x: 115, width: 30 },
                { header: "Використань", x: 145, width: 15 }
            ];

            // Add header
            columns.forEach(col => {
                pdf.text(col.header, col.x, 25);
            });

            // Add rows
            let rowY = 33;
            const limit = Math.min(filteredServices.length, 40);

            for (let i = 0; i < limit; i++) {
                const service = filteredServices[i];

                if (rowY > 270) {
                    pdf.addPage();
                    rowY = 20;
                }

                if (i % 2 === 1) {
                    pdf.setFillColor(248, 250, 252); // #f8fafc
                    pdf.rect(15, rowY - 4, 180, 7, 'F');
                }

                pdf.text(truncateText(service.serviceName, 28), columns[0].x, rowY);
                pdf.text(truncateText(service.serviceType?.name || "Невідомо", 18), columns[1].x, rowY);
                pdf.text(`${parseFloat(service.estimateCost).toFixed(2)}₴`, columns[2].x, rowY);
                pdf.text((service.projectServices?.length || 0).toString(), columns[3].x, rowY);

                rowY += 7;
            }

            if (filteredServices.length > limit) {
                pdf.setFontSize(10);
                pdf.setTextColor(100, 116, 139); // #64748b
                pdf.text(`* Показано ${limit} з ${filteredServices.length} послуг`, 15, rowY + 5);
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const fileName = `звіт_послуги_${timestamp}.pdf`;

            pdf.save(fileName);
            toast.success("Експорт до PDF виконано успішно!");
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error(`Помилка експорту: ${error.message}`);
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
        return `${parseFloat(amount).toFixed(2)}₴`;
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
            toast.success(`Послугу "${serviceToDelete.serviceName}" успішно видалено`);
            refetchServices();
        } catch (error) {
            toast.error(`Помилка видалення: ${error.message}`);
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
                toast.success(`Послугу "${serviceData.serviceName}" оновлено`);
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
                toast.success(`Послугу "${serviceData.serviceName}" створено`);
            }

            refetchServices();
            setIsFormOpen(false);
        } catch (error) {
            toast.error(`Помилка збереження: ${error.message}`);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Loading / error
    if (servicesLoading || serviceTypesLoading) {
        return <div className="loading-message">Завантаження даних...</div>;
    }

    if (servicesError) {
        return <div className="error-message">Помилка завантаження: {servicesError.message}</div>;
    }

    // Render
    return (
        <div className="service-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Панель послуг</h1>
                </div>
                <div className="header-controls">
                    <ExportButton
                        onExportExcel={exportToExcel}
                        onExportPdf={exportToPdf}
                        isExporting={isExporting}
                    />
                    <Button variant="primary" onClick={handleAddService} icon="+">
                        Додати послугу
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowStats((prev) => !prev)}
                    >
                        {showStats ? "Сховати статистику та графіки" : "Показати статистику та графіки"}
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
                    <h2>Список послуг</h2>
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
                title={editingService ? "Редагувати послугу" : "Додати послугу"}
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
                title="Видалення послуги"
                message={`Ви впевнені, що хочете видалити послугу "${serviceToDelete?.serviceName}"?`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />
        </div>
    );
}
