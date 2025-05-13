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
                    priority
                    serviceInProgress {
                        projectService {
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