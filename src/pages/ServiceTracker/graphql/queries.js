// src/pages/ServiceTracker/material-review-graphql/queries.js
import { gql } from "@apollo/client";

// Query to get all project services with their related services in progress
export const GET_ALL_PROJECT_SERVICES = gql`
    query GetAllProjectServices {
        projectServices {
            id
            amount
            service {
                id
                serviceName
                estimateCost
                duration
                serviceType {
                    id
                    name
                }
            }
            project {
                id
                name
                client {
                    name
                }
                status {
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
                    duration
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
                    duration
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