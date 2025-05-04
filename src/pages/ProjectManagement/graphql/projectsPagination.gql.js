// src/pages/ProjectManagement/material-review-graphql/projectsPagination.gql.js
import { gql } from "@apollo/client";

export const GET_PAGINATED_PROJECTS_WITH_TOTAL = gql`
    query GetPaginatedProjectsWithTotal($input: PaginatedProjectsInput!) {
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
                }
                manager {
                    id
                    name
                    surname
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

// This mutation will be used for deleting projects
export const DELETE_PROJECT = gql`
    mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
    }
`;

// Used to get reference data for filters
export const GET_FILTER_REFERENCE_DATA = gql`
    query GetFilterReferenceData {
        projectTypes {
            id
            name
        }
        projectStatuses {
            id
            name
        }
        serviceTypes {
            id
            name
        }
        clients {
            id
            name
        }
        users(role: "ProjectManager") {
            id
            name
            surname
        }
    }
`;