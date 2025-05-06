// src/pages/ServiceTracker/graphql/queries.js
import { gql } from "@apollo/client";

// Paginated query for project services with flexible filtering
export const GET_PAGINATED_PROJECT_SERVICES = gql`
    query GetPaginatedProjectServices($input: PaginatedProjectServicesInput!) {
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
                }
            }
            pageInfo {
                totalElements
                totalPages
                size
                number
                first
                last
                numberOfElements
            }
        }
    }
`;

// Query to get a specific ProjectService's services in progress with task details
export const GET_SERVICES_IN_PROGRESS_BY_PROJECT_SERVICE = gql`
    query GetServicesInProgressByProjectService($projectServiceId: ID!) {
        servicesInProgressByProjectService(projectServiceId: $projectServiceId) {
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
                deadline
                priority
                value
                taskStatus {
                    id
                    name
                }
                assignedWorker {
                    id
                    name
                    surname
                }
            }
        }
    }
`;
export const GET_PAGINATED_PROJECTS = gql`
    query GetPaginatedProjects($input: PaginatedProjectsInput!) {
        paginatedProjects(input: $input) {
            content {
                id
                name
                cost
                estimateCost
                registrationDate
                startDate
                endDate
                paymentDeadline
                status {
                    id
                    name
                }
                client {
                    id
                    name
                }
                projectServices {
                    id
                    amount
                    service {
                        id
                        serviceName
                    }
                    servicesInProgress {
                        id
                    }
                }
            }
            pageInfo {
                totalElements
                totalPages
                size
                number
                first
                last
                numberOfElements
            }
        }
    }
`;


/* ---------------------------------- FRAGMENT ---------------------------------- */
export const PROJECT_WITH_SERVICES_FIELDS = gql`
    fragment ProjectWithServicesFields on Project {
        id
        name
        registrationDate
        startDate
        endDate
        cost
        estimateCost
        paymentDeadline
        description
        createDatetime
        updateDatetime

        status   { id name }
        projectType { id name }
        client  { id name }
        manager { id name surname }

        projectServices {
            id
            amount
            createDatetime
            updateDatetime

            service {
                id
                serviceName
                estimateCost
                createDatetime
                updateDatetime
                serviceType { id name }
            }

            servicesInProgress {
                id
                startDate
                endDate
                cost
                status { id name }
            }
        }
    }
`;

/* ---------------------- ПАГІНОВАНИЙ ЗАПИТ З ФІЛЬТРАМИ ---------------------- */
export const GET_PAGINATED_PROJECTS_WITH_SERVICES = gql`
    query PaginatedProjects($input: PaginatedProjectsInput!) {
        paginatedProjects(input: $input) {
            content {
                ...ProjectWithServicesFields
            }
            pageInfo {
                totalElements
                totalPages
                size
                number
                first
                last
                numberOfElements
            }
        }
    }
    ${PROJECT_WITH_SERVICES_FIELDS}
`;


export const GET_PROJECTS_WITH_SERVICES = gql`
    query GetProjectsWithServices {
        projects {
            id
            name
            registrationDate
            startDate
            endDate
            cost
            estimateCost
            paymentDeadline
            description
            createDatetime
            updateDatetime

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
            }

            manager {
                id
                name
                surname
            }

            projectServices {
                id
                amount
                createDatetime
                updateDatetime

                service {
                    id
                    serviceName
                    estimateCost
                    createDatetime
                    updateDatetime
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
                }

                project {
                    id
                    name
                    client {
                        id
                        name
                    }
                }
            }
        }
    }
`;

// Query to get service statuses for the dropdown
export const GET_SERVICE_STATUSES = gql`
    query GetServiceStatuses {
        serviceInProgressStatuses {
            id
            name
        }
    }
`;

// Query to get task statuses for the dropdown
export const GET_TASK_STATUSES = gql`
    query GetTaskStatuses {
        taskStatuses {
            id
            name
        }
    }
`;

// Query to get workers for task assignment dropdown
export const GET_WORKERS = gql`
    query GetWorkers {
        workers {
            id
            name
            surname
            position {
                name
            }
        }
    }
`;

// Query to get details about a specific project with its services
export const GET_PROJECT_DETAILS = gql`
    query GetProjectDetails($projectId: ID!) {
        project(id: $projectId) {
            id
            name
            description
            startDate
            endDate
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
                }
            }
        }
    }
`;

// New queries for filter options
export const GET_SERVICE_TYPES = gql`
    query GetServiceTypes {
        serviceTypes {
            id
            name
        }
    }
`;

export const GET_PROJECT_STATUSES = gql`
    query GetProjectStatuses {
        projectStatuses {
            id
            name
        }
    }
`;

export const GET_PROJECT_TYPES = gql`
    query GetProjectTypes {
        projectTypes {
            id
            name
        }
    }
`;

export const GET_CLIENTS = gql`
    query GetClients {
        clients {
            id
            name
        }
    }
`;

export const GET_MANAGERS = gql`
    query GetManagers {
        workersByPosition(position: "project manager"){
            id,
            name,
            surname
        }
    }
`;