// src/utils/exportUtils.js
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Creates a basic Excel workbook with customized styles
 * @returns {ExcelJS.Workbook} Excel workbook
 */
const createWorkbook = () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AdManager';
    workbook.lastModifiedBy = 'AdManager Dashboard';
    workbook.created = new Date();
    workbook.modified = new Date();

    return workbook;
};

/**
 * Adds a title row to a worksheet
 * @param {ExcelJS.Worksheet} worksheet - Target worksheet
 * @param {string} title - Title text
 * @param {number} span - Number of columns to span
 */
const addTitleRow = (worksheet, title, span) => {
    const titleRow = worksheet.addRow([title]);
    titleRow.height = 30;
    titleRow.font = { size: 16, bold: true };
    worksheet.mergeCells(titleRow.number, 1, titleRow.number, span);
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add empty row after title
    worksheet.addRow([]);
};

/**
 * Adds a table header row to a worksheet
 * @param {ExcelJS.Worksheet} worksheet - Target worksheet
 * @param {Array<string>} headers - Headers array
 */
const addHeaderRow = (worksheet, headers) => {
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 20;
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Style header cells
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E7FF' } // Light blue background
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
};

/**
 * Adds a chart image to a worksheet
 * @param {ExcelJS.Worksheet} worksheet - Target worksheet
 * @param {HTMLElement} chartElement - Chart DOM element
 * @param {number} startRow - Starting row
 * @param {number} startCol - Starting column
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Promise<void>}
 */
const addChartToWorksheet = async (worksheet, chartElement, startRow, startCol, width, height) => {
    if (!chartElement) return;

    try {
        const canvas = await html2canvas(chartElement, { scale: 2 });
        const imageData = canvas.toDataURL('image/png');

        // Remove header from base64 string
        const base64Image = imageData.replace(/^data:image\/png;base64,/, '');

        const imageId = worksheet.workbook.addImage({
            base64: base64Image,
            extension: 'png',
        });

        worksheet.addImage(imageId, {
            tl: { col: startCol, row: startRow },
            ext: { width, height }
        });

        // Add empty rows after chart
        worksheet.addRow([]);
        worksheet.addRow([]);
    } catch (error) {
        console.error('Error adding chart to Excel:', error);
    }
};

/**
 * Exports dashboard data to Excel file
 * @param {Object} data - Dashboard data object
 * @param {string} title - Dashboard title
 * @param {Array<{element: HTMLElement, title: string}>} charts - Chart elements to include
 * @param {string} filename - Export filename
 */
export const exportToExcel = async (data, title, charts = [], filename = 'dashboard-export.xlsx') => {
    const workbook = createWorkbook();
    const worksheet = workbook.addWorksheet('Dashboard');

    // Set column widths
    worksheet.columns = [
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Value', key: 'value', width: 15 },
        { header: 'Additional Info', key: 'additionalInfo', width: 25 },
    ];

    // Add title
    addTitleRow(worksheet, title, 3);

    // Add header section with metadata
    worksheet.addRow(['Export Date', new Date().toLocaleString()]);
    worksheet.addRow(['Total Records', data.totalRecords || 'N/A']);
    worksheet.addRow([]);

    // Add section title
    const sectionRow = worksheet.addRow(['Dashboard Data']);
    sectionRow.font = { bold: true, size: 14 };
    worksheet.addRow([]);

    // Add data headers
    addHeaderRow(worksheet, ['Category', 'Value', 'Additional Info']);

    // Add data rows
    data.items.forEach(item => {
        const row = worksheet.addRow([
            item.name || item.category || 'N/A',
            item.value || 'N/A',
            item.additionalInfo || ''
        ]);

        // Style data rows
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    // Add charts if provided
    let currentRow = worksheet.rowCount + 2;
    for (const chart of charts) {
        if (chart.element) {
            // Add chart title
            const chartTitleRow = worksheet.addRow([chart.title || 'Chart']);
            chartTitleRow.font = { bold: true, size: 14 };
            worksheet.addRow([]);

            // Add chart image
            await addChartToWorksheet(worksheet, chart.element, currentRow, 1, 500, 300);
            currentRow = worksheet.rowCount + 2;
        }
    }

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * Creates a PDF document with dashboard data
 * @param {Object} data - Dashboard data object
 * @param {string} title - Dashboard title
 * @param {Array<{element: HTMLElement, title: string}>} charts - Chart elements to include
 * @param {string} filename - Export filename
 */
export const exportToPdf = async (data, title, charts = [], filename = 'dashboard-export.pdf') => {
    // Create new PDF document (A4 size)
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 15, { align: 'center' });

    // Add metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Export Date: ${new Date().toLocaleString()}`, 15, 25);
    doc.text(`Total Records: ${data.totalRecords || 'N/A'}`, 15, 30);

    // Add data table
    const tableColumn = ['Category', 'Value', 'Additional Info'];
    const tableRows = data.items.map(item => [
        item.name || item.category || 'N/A',
        item.value !== undefined ? item.value.toString() : 'N/A',
        item.additionalInfo || ''
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        margin: { top: 35 }
    });

    // Add charts
    let currentY = doc.autoTable.previous.finalY + 15;

    for (const chart of charts) {
        if (chart.element) {
            // Check if we need a new page for this chart
            if (currentY > 220) {
                doc.addPage();
                currentY = 20;
            }

            // Add chart title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(chart.title || 'Chart', 15, currentY);
            currentY += 10;

            try {
                // Convert chart to canvas/image
                const canvas = await html2canvas(chart.element, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');

                // Calculate dimensions to fit on page
                const imgWidth = 180;
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();

                const imgHeight = canvas.height * imgWidth / canvas.width;

                // Check if chart will fit on current page
                if (currentY + imgHeight > pageHeight - 20) {
                    doc.addPage();
                    currentY = 20;
                }

                // Add chart image
                doc.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, currentY, imgWidth, imgHeight);
                currentY += imgHeight + 20;
            } catch (error) {
                console.error('Error adding chart to PDF:', error);
                currentY += 10;
            }
        }
    }

    // Save the PDF
    doc.save(filename);
};