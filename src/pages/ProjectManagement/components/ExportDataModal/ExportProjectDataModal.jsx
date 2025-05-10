// src/pages/ProjectManagement/components/ExportDataModal/ExportProjectDataModal.jsx
import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Modal from "../../../../components/common/Modal/Modal";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import "./ExportProjectDataModal.css";

// GraphQL query to get projects for export with all related data
const GET_PROJECTS_FOR_EXPORT = gql`
    query GetProjectsForExport($input: PaginatedProjectsInput!) {
        paginatedProjects(input: $input) {
            content {
                id
                name
                description
                registrationDate
                startDate
                endDate
                cost
                estimateCost
                paymentDeadline
                status {
                    id
                    name
                }
                projectType {
                    id
                    name
                }
                client {
                    id
                    name
                    email
                    phoneNumber
                }
                manager {
                    id
                    name
                    surname
                }
                projectServices {
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
                            description
                            startDate
                            endDate
                            deadline
                            priority
                            value
                            taskStatus {
                                id
                                name
                            }
                            assignedWorker {
                                name
                                surname
                            }
                        }
                    }
                }
                payments {
                    id
                    transactionNumber
                    paymentSum
                    paymentDate
                    paymentPurpose {
                        id
                        name
                    }
                }
            }
            pageInfo {
                totalElements
            }
        }
    }
`;

export default function ExportProjectDataModal({
                                                   isOpen,
                                                   onClose,
                                                   filters = {},
                                                   currentSortField,
                                                   currentSortDirection
                                               }) {
    // Export options state
    const [exportFormat, setExportFormat] = useState("csv");
    const [selectedFields, setSelectedFields] = useState({
        // Project details
        projectName: true,
        projectDescription: false,
        projectType: true,
        status: true,
        startDate: true,
        endDate: true,
        estimateCost: true,
        actualCost: true,
        paymentDeadline: false,

        // Client info
        clientName: true,
        clientEmail: false,
        clientPhone: false,

        // Manager info
        managerName: true,

        // Services
        includeServices: true,
        serviceName: true,
        serviceType: true,
        serviceDescription: false,
        serviceAmount: true,
        serviceEstimateCost: true,

        // Service implementations
        includeImplementations: true,
        implementationStartDate: true,
        implementationEndDate: true,
        implementationCost: true,
        implementationStatus: true,

        // Tasks
        includeTasks: true,
        taskName: true,
        taskDescription: false,
        taskPriority: true,
        taskStatus: true,
        taskDeadline: true,
        taskAssignee: true,

        // Payments
        includePayments: true,
        paymentAmount: true,
        paymentDate: true,
        paymentPurpose: true,
        transactionNumber: true
    });

    const [includeHeaders, setIncludeHeaders] = useState(true);
    const [flattenStructure, setFlattenStructure] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Fetch projects data for export
    const { loading, error, data } = useQuery(GET_PROJECTS_FOR_EXPORT, {
        variables: {
            input: {
                page: 0,
                size: 100, // Limit export to 100 projects
                sortField: currentSortField || "name",
                sortDirection: currentSortDirection || "ASC",
                filter: buildFilterInput(filters)
            }
        },
        skip: !isOpen,
        fetchPolicy: "network-only"
    });

    // Build filter input from filters object
    function buildFilterInput(filters) {
        const filterInput = {};

        if (filters.nameContains) filterInput.nameContains = filters.nameContains;
        if (filters.descriptionContains) filterInput.descriptionContains = filters.descriptionContains;
        if (filters.status?.length) filterInput.statusIds = filters.status.map(id => Number(id));
        if (filters.projectType?.length) filterInput.projectTypeIds = filters.projectType.map(id => Number(id));
        if (filters.clientId?.length) filterInput.clientIds = filters.clientId.map(id => Number(id));
        if (filters.managerId?.length) filterInput.managerIds = filters.managerId.map(id => Number(id));
        if (filters.date?.from) filterInput.startDateFrom = filters.date.from;
        if (filters.date?.to) filterInput.startDateTo = filters.date.to;
        if (filters.cost?.min !== undefined) filterInput.costMin = filters.cost.min;
        if (filters.cost?.max !== undefined) filterInput.costMax = filters.cost.max;

        return filterInput;
    }

    // Toggle all fields in a section
    const toggleSectionFields = (section, checked) => {
        const newState = { ...selectedFields };

        // Define fields for each section
        const sectionFields = {
            project: ['projectName', 'projectDescription', 'projectType', 'status', 'startDate', 'endDate', 'estimateCost', 'actualCost', 'paymentDeadline'],
            client: ['clientName', 'clientEmail', 'clientPhone'],
            manager: ['managerName'],
            services: ['includeServices', 'serviceName', 'serviceType', 'serviceDescription', 'serviceAmount', 'serviceEstimateCost'],
            implementations: ['includeImplementations', 'implementationStartDate', 'implementationEndDate', 'implementationCost', 'implementationStatus'],
            tasks: ['includeTasks', 'taskName', 'taskDescription', 'taskPriority', 'taskStatus', 'taskDeadline', 'taskAssignee'],
            payments: ['includePayments', 'paymentAmount', 'paymentDate', 'paymentPurpose', 'transactionNumber']
        };

        // Update all fields in the section
        (sectionFields[section] || []).forEach(field => {
            newState[field] = checked;
        });

        setSelectedFields(newState);
    };

    // Toggle all fields
    const toggleAllFields = (checked) => {
        const newState = {};
        Object.keys(selectedFields).forEach(key => {
            newState[key] = checked;
        });
        setSelectedFields(newState);
    };

    // Handle individual field change
    const handleFieldChange = (field) => {
        // Special handling for section toggles
        if (field === 'includeServices' || field === 'includeImplementations' ||
            field === 'includeTasks' || field === 'includePayments') {

            setSelectedFields(prev => {
                const newState = { ...prev, [field]: !prev[field] };

                // If disabling a section, disable all fields in that section
                if (!newState[field]) {
                    if (field === 'includeServices') {
                        toggleSectionFields('services', false);
                        // Also disable implementations and tasks if services are disabled
                        newState.includeImplementations = false;
                        toggleSectionFields('implementations', false);
                        newState.includeTasks = false;
                        toggleSectionFields('tasks', false);
                    }
                    else if (field === 'includeImplementations') {
                        toggleSectionFields('implementations', false);
                        // Also disable tasks if implementations are disabled
                        newState.includeTasks = false;
                        toggleSectionFields('tasks', false);
                    }
                    else if (field === 'includeTasks') {
                        toggleSectionFields('tasks', false);
                    }
                    else if (field === 'includePayments') {
                        toggleSectionFields('payments', false);
                    }
                }

                return newState;
            });
        } else {
            // Regular field toggle
            setSelectedFields(prev => ({
                ...prev,
                [field]: !prev[field]
            }));
        }
    };

    // Export data
    const exportData = () => {
        if (!data || !data.paginatedProjects || !data.paginatedProjects.content) {
            alert("No data available for export");
            return;
        }

        setIsExporting(true);

        try {
            const projects = data.paginatedProjects.content;

            let result;
            if (exportFormat === "csv") {
                result = exportToCSV(projects);
            } else if (exportFormat === "json") {
                result = exportToJSON(projects);
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

    // Export to CSV
    const exportToCSV = (projects) => {
        let csvRows = [];
        let headers = [];

        // Add project fields to headers
        if (selectedFields.projectName) headers.push("Project Name");
        if (selectedFields.projectType) headers.push("Project Type");
        if (selectedFields.status) headers.push("Status");
        if (selectedFields.projectDescription) headers.push("Description");
        if (selectedFields.startDate) headers.push("Start Date");
        if (selectedFields.endDate) headers.push("End Date");
        if (selectedFields.estimateCost) headers.push("Estimated Cost");
        if (selectedFields.actualCost) headers.push("Actual Cost");
        if (selectedFields.paymentDeadline) headers.push("Payment Deadline");

        // Add client fields
        if (selectedFields.clientName) headers.push("Client Name");
        if (selectedFields.clientEmail) headers.push("Client Email");
        if (selectedFields.clientPhone) headers.push("Client Phone");

        // Add manager fields
        if (selectedFields.managerName) headers.push("Manager");

        if (flattenStructure) {
            // For flat structure, we add fields for services, implementations, tasks, payments
            // that will be repeated for each project

            if (selectedFields.includeServices) {
                if (selectedFields.serviceName) headers.push("Service Name");
                if (selectedFields.serviceType) headers.push("Service Type");
                if (selectedFields.serviceDescription) headers.push("Service Description");
                if (selectedFields.serviceAmount) headers.push("Service Amount");
                if (selectedFields.serviceEstimateCost) headers.push("Service Est. Cost");

                if (selectedFields.includeImplementations) {
                    if (selectedFields.implementationStartDate) headers.push("Implementation Start");
                    if (selectedFields.implementationEndDate) headers.push("Implementation End");
                    if (selectedFields.implementationCost) headers.push("Implementation Cost");
                    if (selectedFields.implementationStatus) headers.push("Implementation Status");

                    if (selectedFields.includeTasks) {
                        if (selectedFields.taskName) headers.push("Task Name");
                        if (selectedFields.taskDescription) headers.push("Task Description");
                        if (selectedFields.taskPriority) headers.push("Task Priority");
                        if (selectedFields.taskStatus) headers.push("Task Status");
                        if (selectedFields.taskDeadline) headers.push("Task Deadline");
                        if (selectedFields.taskAssignee) headers.push("Task Assignee");
                    }
                }
            }

            if (selectedFields.includePayments) {
                if (selectedFields.paymentAmount) headers.push("Payment Amount");
                if (selectedFields.paymentDate) headers.push("Payment Date");
                if (selectedFields.paymentPurpose) headers.push("Payment Purpose");
                if (selectedFields.transactionNumber) headers.push("Transaction #");
            }

            // Add headers row
            if (includeHeaders) {
                csvRows.push(headers.join(","));
            }

            // Add data rows with flattened structure
            projects.forEach(project => {
                // If no services/tasks/payments selected, just add one row per project
                if ((!selectedFields.includeServices || project.projectServices?.length === 0) &&
                    (!selectedFields.includePayments || project.payments?.length === 0)) {
                    const row = buildProjectRow(project);
                    csvRows.push(row.join(","));
                }
                // If services are selected but no implementations/tasks, add one row per service
                else if (selectedFields.includeServices &&
                    (!selectedFields.includeImplementations ||
                        project.projectServices.every(ps => !ps.servicesInProgress?.length))) {

                    if (project.projectServices?.length && selectedFields.includeServices) {
                        project.projectServices.forEach(ps => {
                            const row = buildProjectRow(project);
                            const serviceRow = buildServiceRow(ps);
                            csvRows.push([...row, ...serviceRow].join(","));
                        });
                    } else if (project.payments?.length && selectedFields.includePayments) {
                        project.payments.forEach(payment => {
                            const row = buildProjectRow(project);
                            const paymentRow = buildPaymentRow(payment);
                            csvRows.push([...row, ...paymentRow].join(","));
                        });
                    }
                }
                // Most complex case: services with implementations and tasks
                else {
                    // For each service implementation, get one row
                    let hasSipRows = false;

                    if (selectedFields.includeServices && selectedFields.includeImplementations) {
                        project.projectServices?.forEach(ps => {
                            if (ps.servicesInProgress?.length) {
                                ps.servicesInProgress.forEach(sip => {
                                    // If tasks are enabled and exist, create a row per task
                                    if (selectedFields.includeTasks && sip.tasks?.length) {
                                        sip.tasks.forEach(task => {
                                            const projectRow = buildProjectRow(project);
                                            const serviceRow = buildServiceRow(ps);
                                            const sipRow = buildImplementationRow(sip);
                                            const taskRow = buildTaskRow(task);
                                            csvRows.push([...projectRow, ...serviceRow, ...sipRow, ...taskRow].join(","));
                                        });
                                        hasSipRows = true;
                                    } else {
                                        // No tasks, just add implementation row
                                        const projectRow = buildProjectRow(project);
                                        const serviceRow = buildServiceRow(ps);
                                        const sipRow = buildImplementationRow(sip);
                                        csvRows.push([...projectRow, ...serviceRow, ...sipRow].join(","));
                                        hasSipRows = true;
                                    }
                                });
                            } else if (selectedFields.includeServices) {
                                // Service without implementations
                                const projectRow = buildProjectRow(project);
                                const serviceRow = buildServiceRow(ps);
                                csvRows.push([...projectRow, ...serviceRow].join(","));
                                hasSipRows = true;
                            }
                        });
                    }

                    // Add payment rows if no service rows were added
                    if (!hasSipRows && selectedFields.includePayments && project.payments?.length) {
                        project.payments.forEach(payment => {
                            const projectRow = buildProjectRow(project);
                            const paymentRow = buildPaymentRow(payment);
                            csvRows.push([...projectRow, ...paymentRow].join(","));
                        });
                    }
                    // If no rows were added (e.g., no services/payments), add a single project row
                    if (!hasSipRows && (!selectedFields.includePayments || !project.payments?.length)) {
                        const row = buildProjectRow(project);
                        csvRows.push(row.join(","));
                    }
                }
            });
        } else {
            // Non-flattened structure (simple project list without nested data)
            // Add headers row
            if (includeHeaders) {
                csvRows.push(headers.join(","));
            }

            // Add one row per project with basic info
            projects.forEach(project => {
                const row = buildProjectRow(project);
                csvRows.push(row.join(","));
            });
        }

        // Helper functions to build rows
        function buildProjectRow(project) {
            const row = [];

            if (selectedFields.projectName) row.push(`"${project.name?.replace(/"/g, '""') || ""}"` );
            if (selectedFields.projectType) row.push(`"${project.projectType?.name?.replace(/"/g, '""') || ""}"` );
            if (selectedFields.status) row.push(`"${project.status?.name?.replace(/"/g, '""') || ""}"` );
            if (selectedFields.projectDescription) row.push(`"${project.description?.replace(/"/g, '""') || ""}"` );
            if (selectedFields.startDate) row.push(project.startDate || "");
            if (selectedFields.endDate) row.push(project.endDate || "");
            if (selectedFields.estimateCost) row.push(project.estimateCost || "0");
            if (selectedFields.actualCost) row.push(project.cost || "0");
            if (selectedFields.paymentDeadline) row.push(project.paymentDeadline || "");

            if (selectedFields.clientName) row.push(`"${project.client?.name?.replace(/"/g, '""') || ""}"` );
            if (selectedFields.clientEmail) row.push(`"${project.client?.email?.replace(/"/g, '""') || ""}"` );
            if (selectedFields.clientPhone) row.push(`"${project.client?.phoneNumber?.replace(/"/g, '""') || ""}"` );

            if (selectedFields.managerName) {
                const manager = project.manager ? `${project.manager.name} ${project.manager.surname}` : "";
                row.push(`"${manager.replace(/"/g, '""')}"`);
            }

            return row;
        }

        function buildServiceRow(ps) {
            const row = [];

            if (selectedFields.serviceName) row.push(`"${ps.service?.serviceName?.replace(/"/g, '""') || ""}"` );
            if (selectedFields.serviceType) row.push(`"${ps.service?.serviceType?.name?.replace(/"/g, '""') || ""}"` );
            if (selectedFields.serviceDescription) row.push(`"${ps.service?.description?.replace(/"/g, '""') || ""}"` );
            if (selectedFields.serviceAmount) row.push(ps.amount || "0");
            if (selectedFields.serviceEstimateCost) row.push(ps.service?.estimateCost || "0");

            // Add empty cells for implementations/tasks if they're selected but we don't have implementation data
            if (selectedFields.includeImplementations) {
                if (selectedFields.implementationStartDate) row.push("");
                if (selectedFields.implementationEndDate) row.push("");
                if (selectedFields.implementationCost) row.push("");
                if (selectedFields.implementationStatus) row.push("");

                if (selectedFields.includeTasks) {
                    if (selectedFields.taskName) row.push("");
                    if (selectedFields.taskDescription) row.push("");
                    if (selectedFields.taskPriority) row.push("");
                    if (selectedFields.taskStatus) row.push("");
                    if (selectedFields.taskDeadline) row.push("");
                    if (selectedFields.taskAssignee) row.push("");
                }
            }

            // Add empty cells for payments if they're selected
            if (selectedFields.includePayments) {
                if (selectedFields.paymentAmount) row.push("");
                if (selectedFields.paymentDate) row.push("");
                if (selectedFields.paymentPurpose) row.push("");
                if (selectedFields.transactionNumber) row.push("");
            }

            return row;
        }

        function buildImplementationRow(sip) {
            const row = [];

            if (selectedFields.implementationStartDate) row.push(sip.startDate || "");
            if (selectedFields.implementationEndDate) row.push(sip.endDate || "");
            if (selectedFields.implementationCost) row.push(sip.cost || "0");
            if (selectedFields.implementationStatus) row.push(`"${sip.status?.name?.replace(/"/g, '""') || ""}"`);

            // Add empty cells for tasks if they're selected but we don't have task data
            if (selectedFields.includeTasks) {
                if (selectedFields.taskName) row.push("");
                if (selectedFields.taskDescription) row.push("");
                if (selectedFields.taskPriority) row.push("");
                if (selectedFields.taskStatus) row.push("");
                if (selectedFields.taskDeadline) row.push("");
                if (selectedFields.taskAssignee) row.push("");
            }

            // Add empty cells for payments if they're selected
            if (selectedFields.includePayments) {
                if (selectedFields.paymentAmount) row.push("");
                if (selectedFields.paymentDate) row.push("");
                if (selectedFields.paymentPurpose) row.push("");
                if (selectedFields.transactionNumber) row.push("");
            }

            return row;
        }

        function buildTaskRow(task) {
            const row = [];

            if (selectedFields.taskName) row.push(`"${task.name?.replace(/"/g, '""') || ""}"`);
            if (selectedFields.taskDescription) row.push(`"${task.description?.replace(/"/g, '""') || ""}"`);
            if (selectedFields.taskPriority) row.push(task.priority || "");
            if (selectedFields.taskStatus) row.push(`"${task.taskStatus?.name?.replace(/"/g, '""') || ""}"`);
            if (selectedFields.taskDeadline) row.push(task.deadline || "");

            if (selectedFields.taskAssignee) {
                const assignee = task.assignedWorker
                    ? `${task.assignedWorker.name} ${task.assignedWorker.surname}`
                    : "";
                row.push(`"${assignee.replace(/"/g, '""')}"`);
            }

            // Add empty cells for payments if they're selected
            if (selectedFields.includePayments) {
                if (selectedFields.paymentAmount) row.push("");
                if (selectedFields.paymentDate) row.push("");
                if (selectedFields.paymentPurpose) row.push("");
                if (selectedFields.transactionNumber) row.push("");
            }

            return row;
        }

        function buildPaymentRow(payment) {
            const row = [];

            // Add empty cells for services if they're selected
            if (selectedFields.includeServices) {
                if (selectedFields.serviceName) row.push("");
                if (selectedFields.serviceType) row.push("");
                if (selectedFields.serviceDescription) row.push("");
                if (selectedFields.serviceAmount) row.push("");
                if (selectedFields.serviceEstimateCost) row.push("");

                if (selectedFields.includeImplementations) {
                    if (selectedFields.implementationStartDate) row.push("");
                    if (selectedFields.implementationEndDate) row.push("");
                    if (selectedFields.implementationCost) row.push("");
                    if (selectedFields.implementationStatus) row.push("");

                    if (selectedFields.includeTasks) {
                        if (selectedFields.taskName) row.push("");
                        if (selectedFields.taskDescription) row.push("");
                        if (selectedFields.taskPriority) row.push("");
                        if (selectedFields.taskStatus) row.push("");
                        if (selectedFields.taskDeadline) row.push("");
                        if (selectedFields.taskAssignee) row.push("");
                    }
                }
            }

            // Add payment details
            if (selectedFields.paymentAmount) row.push(payment.paymentSum || "0");
            if (selectedFields.paymentDate) row.push(payment.paymentDate || "");
            if (selectedFields.paymentPurpose) row.push(`"${payment.paymentPurpose?.name?.replace(/"/g, '""') || ""}"`);
            if (selectedFields.transactionNumber) row.push(`"${payment.transactionNumber?.replace(/"/g, '""') || ""}"`);

            return row;
        }

        const csvContent = csvRows.join("\n");
        const BOM = "\uFEFF"; // UTF-8 BOM
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        return { url, filename: "projects_export.csv" };
    };

    // Export to JSON
    const exportToJSON = (projects) => {
        const formattedProjects = projects.map(project => {
            // Create the base project object with selected fields
            const formattedProject = {};

            if (selectedFields.projectName) formattedProject.name = project.name;
            if (selectedFields.projectType) formattedProject.type = project.projectType?.name;
            if (selectedFields.status) formattedProject.status = project.status?.name;
            if (selectedFields.projectDescription) formattedProject.description = project.description;
            if (selectedFields.startDate) formattedProject.startDate = project.startDate;
            if (selectedFields.endDate) formattedProject.endDate = project.endDate;
            if (selectedFields.estimateCost) formattedProject.estimatedCost = project.estimateCost;
            if (selectedFields.actualCost) formattedProject.actualCost = project.cost;
            if (selectedFields.paymentDeadline) formattedProject.paymentDeadline = project.paymentDeadline;

            // Add client information if selected
            if (selectedFields.clientName || selectedFields.clientEmail || selectedFields.clientPhone) {
                formattedProject.client = {};
                if (selectedFields.clientName) formattedProject.client.name = project.client?.name;
                if (selectedFields.clientEmail) formattedProject.client.email = project.client?.email;
                if (selectedFields.clientPhone) formattedProject.client.phone = project.client?.phoneNumber;
            }

            // Add manager information if selected
            if (selectedFields.managerName && project.manager) {
                formattedProject.manager = `${project.manager.name} ${project.manager.surname}`;
            }

            // Add services information if selected
            if (selectedFields.includeServices && project.projectServices?.length) {
                formattedProject.services = project.projectServices.map(ps => {
                    const service = {};

                    if (selectedFields.serviceName) service.name = ps.service?.serviceName;
                    if (selectedFields.serviceType) service.type = ps.service?.serviceType?.name;
                    if (selectedFields.serviceDescription) service.description = ps.service?.description;
                    if (selectedFields.serviceAmount) service.amount = ps.amount;
                    if (selectedFields.serviceEstimateCost) service.estimatedCost = ps.service?.estimateCost;

                    // Add implementations if selected
                    if (selectedFields.includeImplementations && ps.servicesInProgress?.length) {
                        service.implementations = ps.servicesInProgress.map(sip => {
                            const implementation = {};

                            if (selectedFields.implementationStartDate) implementation.startDate = sip.startDate;
                            if (selectedFields.implementationEndDate) implementation.endDate = sip.endDate;
                            if (selectedFields.implementationCost) implementation.cost = sip.cost;
                            if (selectedFields.implementationStatus) implementation.status = sip.status?.name;

                            // Add tasks if selected
                            if (selectedFields.includeTasks && sip.tasks?.length) {
                                implementation.tasks = sip.tasks.map(task => {
                                    const taskObj = {};

                                    if (selectedFields.taskName) taskObj.name = task.name;
                                    if (selectedFields.taskDescription) taskObj.description = task.description;
                                    if (selectedFields.taskPriority) taskObj.priority = task.priority;
                                    if (selectedFields.taskStatus) taskObj.status = task.taskStatus?.name;
                                    if (selectedFields.taskDeadline) taskObj.deadline = task.deadline;
                                    if (selectedFields.taskAssignee && task.assignedWorker) {
                                        taskObj.assignee = `${task.assignedWorker.name} ${task.assignedWorker.surname}`;
                                    }

                                    return taskObj;
                                });
                            }

                            return implementation;
                        });
                    }

                    return service;
                });
            }

            // Add payments information if selected
            if (selectedFields.includePayments && project.payments?.length) {
                formattedProject.payments = project.payments.map(payment => {
                    const paymentObj = {};

                    if (selectedFields.paymentAmount) paymentObj.amount = payment.paymentSum;
                    if (selectedFields.paymentDate) paymentObj.date = payment.paymentDate;
                    if (selectedFields.paymentPurpose) paymentObj.purpose = payment.paymentPurpose?.name;
                    if (selectedFields.transactionNumber) paymentObj.transactionNumber = payment.transactionNumber;

                    return paymentObj;
                });
            }

            return formattedProject;
        });

        const jsonContent = JSON.stringify(formattedProjects, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        return { url, filename: "projects_export.json" };
    };

    // Export to Excel (simplified as CSV with different extension)
    const exportToExcel = (projects) => {
        const csvExport = exportToCSV(projects);
        return { ...csvExport, filename: "projects_export.xlsx" };
    };

    const totalProjects = data?.paginatedProjects?.pageInfo?.totalElements || 0;

    return (

        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Експорт даних проєкту"
            size="large"
        >
            <div className="export-modal-content">
                {loading ? (
                    <div className="export-loading">Завантаження даних проєкту...</div>
                ) : error ? (
                    <div className="export-error">
                        Помилка завантаження даних: {error.message}
                    </div>
                ) : (
                    <>

                            <p>
                                Доступно для експорту: <strong>{totalProjects}</strong>{" "}
                                проєктів із пов’язаними даними
                            </p>

                        <div className="export-sections">
                            <div className="export-section">
                                <h3 className="export-section-title">Формат експорту</h3>
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
                                    <h3 className="export-section-title">Поля для експорту</h3>
                                    <div className="export-select-all">
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => toggleAllFields(true)}
                                        >
                                            Вибрати всі
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => toggleAllFields(false)}
                                        >
                                            Зняти всі
                                        </Button>
                                    </div>
                                </div>

                                <div className="fields-container">
                                    <div className="fields-section">
                                        <h4 className="fields-section-title">
                                            Інформація про проєкт
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => toggleSectionFields('project', true)}
                                            >
                                                Вибрати всі
                                            </Button>
                                        </h4>
                                        <div className="fields-grid">
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.projectName}
                                                    onChange={() => handleFieldChange("projectName")}
                                                />
                                                <span>Назва проєкту</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.projectDescription}
                                                    onChange={() => handleFieldChange("projectDescription")}
                                                />
                                                <span>Опис</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.projectType}
                                                    onChange={() => handleFieldChange("projectType")}
                                                />
                                                <span>Тип проєкту</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.status}
                                                    onChange={() => handleFieldChange("status")}
                                                />
                                                <span>Статус</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.startDate}
                                                    onChange={() => handleFieldChange("startDate")}
                                                />
                                                <span>Дата початку</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.endDate}
                                                    onChange={() => handleFieldChange("endDate")}
                                                />
                                                <span>Дата завершення</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.estimateCost}
                                                    onChange={() => handleFieldChange("estimateCost")}
                                                />
                                                <span>Оцінкова вартість</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.actualCost}
                                                    onChange={() => handleFieldChange("actualCost")}
                                                />
                                                <span>Фактична вартість</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.paymentDeadline}
                                                    onChange={() => handleFieldChange("paymentDeadline")}
                                                />
                                                <span>Термін оплати</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="fields-section">
                                        <h4 className="fields-section-title">
                                            Клієнт та менеджер
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => {
                                                    toggleSectionFields('client', true);
                                                    toggleSectionFields('manager', true);
                                                }}
                                            >
                                                Вибрати всі
                                            </Button>
                                        </h4>
                                        <div className="fields-grid">
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.clientName}
                                                    onChange={() => handleFieldChange("clientName")}
                                                />
                                                <span>Ім’я клієнта</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.clientEmail}
                                                    onChange={() => handleFieldChange("clientEmail")}
                                                />
                                                <span>Email клієнта</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.clientPhone}
                                                    onChange={() => handleFieldChange("clientPhone")}
                                                />
                                                <span>Телефон клієнта</span>
                                            </label>
                                            <label className="export-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.managerName}
                                                    onChange={() => handleFieldChange("managerName")}
                                                />
                                                <span>Менеджер проєкту</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="fields-section">
                                        <h4 className="fields-section-title">
                                            <label className="export-checkbox section-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.includeServices}
                                                    onChange={() => handleFieldChange("includeServices")}
                                                />
                                                <span className="section-toggle-title">Послуги</span>
                                            </label>
                                            {selectedFields.includeServices && (
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => toggleSectionFields('services', true)}
                                                >
                                                    Вибрати всі
                                                </Button>
                                            )}
                                        </h4>
                                        {selectedFields.includeServices && (
                                            <div className="fields-grid">
                                                <label className="export-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFields.serviceName}
                                                        onChange={() => handleFieldChange("serviceName")}
                                                    />
                                                    <span>Назва послуги</span>
                                                </label>
                                                <label className="export-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFields.serviceType}
                                                        onChange={() => handleFieldChange("serviceType")}
                                                    />
                                                    <span>Тип послуги</span>
                                                </label>
                                                <label className="export-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFields.serviceAmount}
                                                        onChange={() => handleFieldChange("serviceAmount")}
                                                    />
                                                    <span>Кількість</span>
                                                </label>
                                                <label className="export-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFields.serviceEstimateCost}
                                                        onChange={() => handleFieldChange("serviceEstimateCost")}
                                                    />
                                                    <span>Оцінкова вартість</span>
                                                </label>
                                            </div>
                                        )}

                                        {selectedFields.includeServices && (
                                            <div className="nested-fields-section">
                                                <h4 className="fields-section-title">
                                                    <label className="export-checkbox section-toggle">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFields.includeImplementations}
                                                            onChange={() => handleFieldChange("includeImplementations")}
                                                        />
                                                        <span className="section-toggle-title">
                                                            Виконання послуг
                                                        </span>
                                                    </label>
                                                    {selectedFields.includeImplementations && (
                                                        <Button
                                                            variant="text"
                                                            size="small"
                                                            onClick={() => toggleSectionFields('implementations', true)}
                                                        >
                                                            Вибрати всі
                                                        </Button>
                                                    )}
                                                </h4>
                                                {selectedFields.includeImplementations && (
                                                    <div className="fields-grid">
                                                        <label className="export-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFields.implementationStartDate}
                                                                onChange={() => handleFieldChange("implementationStartDate")}
                                                            />
                                                            <span>Дата початку</span>
                                                        </label>
                                                        <label className="export-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFields.implementationEndDate}
                                                                onChange={() => handleFieldChange("implementationEndDate")}
                                                            />
                                                            <span>Дата завершення</span>
                                                        </label>
                                                        <label className="export-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFields.implementationCost}
                                                                onChange={() => handleFieldChange("implementationCost")}
                                                            />
                                                            <span>Вартість</span>
                                                        </label>
                                                        <label className="export-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFields.implementationStatus}
                                                                onChange={() => handleFieldChange("implementationStatus")}
                                                            />
                                                            <span>Статус</span>
                                                        </label>
                                                    </div>
                                                )}

                                                {selectedFields.includeImplementations && (
                                                    <div className="nested-fields-section">
                                                        <h4 className="fields-section-title">
                                                            <label className="export-checkbox section-toggle">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedFields.includeTasks}
                                                                    onChange={() => handleFieldChange("includeTasks")}
                                                                />
                                                                <span className="section-toggle-title">Завдання</span>
                                                            </label>
                                                            {selectedFields.includeTasks && (
                                                                <Button
                                                                    variant="text"
                                                                    size="small"
                                                                    onClick={() => toggleSectionFields('tasks', true)}
                                                                >
                                                                    Вибрати всі
                                                                </Button>
                                                            )}
                                                        </h4>
                                                        {selectedFields.includeTasks && (
                                                            <div className="fields-grid">
                                                                <label className="export-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedFields.taskName}
                                                                        onChange={() => handleFieldChange("taskName")}
                                                                    />
                                                                    <span>Назва завдання</span>
                                                                </label>
                                                                <label className="export-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedFields.taskDescription}
                                                                        onChange={() => handleFieldChange("taskDescription")}
                                                                    />
                                                                    <span>Опис</span>
                                                                </label>
                                                                <label className="export-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedFields.taskPriority}
                                                                        onChange={() => handleFieldChange("taskPriority")}
                                                                    />
                                                                    <span>Пріоритет</span>
                                                                </label>
                                                                <label className="export-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedFields.taskStatus}
                                                                        onChange={() => handleFieldChange("taskStatus")}
                                                                    />
                                                                    <span>Статус</span>
                                                                </label>
                                                                <label className="export-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedFields.taskDeadline}
                                                                        onChange={() => handleFieldChange("taskDeadline")}
                                                                    />
                                                                    <span>Кінцевий термін</span>
                                                                </label>
                                                                <label className="export-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedFields.taskAssignee}
                                                                        onChange={() => handleFieldChange("taskAssignee")}
                                                                    />
                                                                    <span>Виконавець</span>
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="fields-section">
                                        <h4 className="fields-section-title">
                                            <label className="export-checkbox section-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFields.includePayments}
                                                    onChange={() => handleFieldChange("includePayments")}
                                                />
                                                <span className="section-toggle-title">Платежі</span>
                                            </label>
                                            {selectedFields.includePayments && (
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => toggleSectionFields('payments', true)}
                                                >
                                                    Вибрати всі
                                                </Button>
                                            )}
                                        </h4>
                                        {selectedFields.includePayments && (
                                            <div className="fields-grid">
                                                <label className="export-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFields.paymentAmount}
                                                        onChange={() => handleFieldChange("paymentAmount")}
                                                    />
                                                    <span>Сума</span>
                                                </label>
                                                <label className="export-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFields.paymentDate}
                                                        onChange={() => handleFieldChange("paymentDate")}
                                                    />
                                                    <span>Дата</span>
                                                </label>
                                                <label className="export-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFields.paymentPurpose}
                                                        onChange={() => handleFieldChange("paymentPurpose")}
                                                    />
                                                    <span>Призначення</span>
                                                </label>
                                                <label className="export-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFields.transactionNumber}
                                                        onChange={() => handleFieldChange("transactionNumber")}
                                                    />
                                                    <span>Номер транзакції</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {exportFormat === "csv" && (
                                <div className="export-section">
                                    <h3 className="export-section-title">Додаткові параметри</h3>
                                    <div className="options-grid">
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={includeHeaders}
                                                onChange={() => setIncludeHeaders(!includeHeaders)}
                                            />
                                            <span>Включити заголовки полів</span>
                                        </label>
                                        <label className="export-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={flattenStructure}
                                                onChange={() => setFlattenStructure(!flattenStructure)}
                                            />
                                            <span>
                                                Згладити структуру даних (один рядок на елемент)
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="export-actions">
                            <Button variant="outline" onClick={onClose}>
                                Скасувати
                            </Button>
                            <Button
                                variant="primary"
                                icon={isExporting ? "⏳" : "📊"}
                                onClick={exportData}
                                disabled={isExporting || !Object.values(selectedFields).some(v => v)}
                            >
                                {isExporting ? "Експортування..." : "Експортувати дані"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}