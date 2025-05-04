// src/pages/ServiceTracker/graphql/queries.js
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

// Query to get service statuses for the dropdown
export const GET_SERVICE_STATUSES = gql`
    query GetServiceStatuses {
        serviceStatuses {
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
            mainRole
        }
    }
`;