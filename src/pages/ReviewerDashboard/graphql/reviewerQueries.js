// src/pages/ReviewerDashboard/graphql/reviewerQueries.js
import { gql } from "@apollo/client";

export const GET_PAGINATED_MATERIALS_WITH_TOTAL = gql`
    query GetPaginatedMaterialsWithTotal($input: PaginatedMaterialsInput!) {
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
                    description
                    priority
                    value
                    createDatetime
                    updateDatetime
                    startDate
                    deadline
                    endDate
                    taskStatus {
                        id
                        name
                    }
                    assignedWorker {
                        id
                        name
                        surname
                    }
                    materials {
                        id
                        name
                        status {
                            id
                            name
                        }
                    }
                    serviceInProgress {
                        id
                        projectService {
                            id
                            service {
                                id
                                serviceName
                            }
                            project {
                                id
                                name
                                registrationDate
                                startDate
                                endDate
                                cost
                                estimateCost
                                status {
                                    id
                                    name
                                }
                                projectType {
                                    id
                                    name
                                }
                                paymentDeadline
                                client {
                                    id
                                    name
                                }
                                manager {
                                    id
                                    name
                                    surname
                                }
                                description
                                projectServices {
                                    id
                                    service {
                                        id
                                        serviceName
                                    }
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
                    materialSummary{
                        id
                        name
                    }
                    reviewer {
                        id
                        name
                        surname
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


export const GET_MATERIAL_SUMMARIES = gql`
    query GetMaterialSummaries {
        materialSummaries {
            id
            name
        }
    }
`;


// Used to get reference data for filters - expanded to include tasks and keywords
export const GET_FILTER_REFERENCE_DATA = gql`
    query GetFilterReferenceData {
        materialStatuses {
            id
            name
        }
        materialTypes {
            id
            name
        }
        languages {
            id
            name
        }
        keywords {
            id
            name
        }
        tasks {
            id
            name
        }
        usageRestrictions {
            id
            name
        }
        licenceTypes {
            id
            name
        }
        targetAudiences {
            id
            name
        }
    }
`;



// GraphQL mutation to submit a review
export const SUBMIT_MATERIAL_REVIEW = gql`
    mutation SubmitMaterialReview($input: CreateMaterialReviewInput!) {
        createMaterialReview(input: $input) {
            id
            comments
            suggestedChange
            reviewer {
                id
                name
                surname
            }
        }
    }
`;

// GraphQL mutation to update an existing review
export const UPDATE_MATERIAL_REVIEW = gql`
    mutation UpdateMaterialReview($id: ID!, $input: UpdateMaterialReviewInput!) {
        updateMaterialReview(id: $id, input: $input) {
            id
            comments
            suggestedChange
            reviewer {
                id
                name
                surname
            }
        }
    }
`;

export const DELETE_MATERIAL_REVIEW = gql`
    mutation DeleteMaterialReview($id: ID!) {
        deleteMaterialReview(id: $id)
    }
`;

// New query for getting task details if needed separately
export const GET_TASK_DETAILS = gql`
    query GetTaskDetails($id: ID!) {
        task(id: $id) {
            id
            name
            description
            priority
            value
            createDatetime
            updateDatetime
            startDate
            deadline
            endDate
            taskStatus {
                id
                name
            }
            assignedWorker {
                id
                name
                surname
            }
            materials {
                id
                name
                status {
                    id
                    name
                }
            }
            serviceInProgress {
                id
                projectService {
                    id
                    service {
                        id
                        serviceName
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
    }
`;

// New query for paginated tasks
export const GET_PAGINATED_TASKS = gql`
    query GetPaginatedTasks($input: PaginatedTasksInput!) {
        paginatedTasks(input: $input) {
            content {
                id
                name
                description
                priority
                value
                createDatetime
                updateDatetime
                startDate
                deadline
                endDate
                taskStatus {
                    id
                    name
                }
                assignedWorker {
                    id
                    name
                    surname
                }
                serviceInProgress {
                    id
                    projectService {
                        id
                        service {
                            id
                            serviceName
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

// New mutation for task status transition if needed
export const TRANSITION_TASK_STATUS = gql`
    mutation TransitionTaskStatus($input: TransitionTaskStatusInput!) {
        transitionTaskStatus(input: $input) {
            id
            taskStatus {
                id
                name
            }
        }
    }
`;