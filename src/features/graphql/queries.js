// src/features/tasks/graphql/queries.js
import { gql } from '@apollo/client';

// Existing query from EmployeeTasks.jsx
export const GET_TASKS_BY_WORKER = gql`
    query MyQuery($workerId: ID!) {
        tasksByWorker(workerId: $workerId) {
            id
            name
            description
            startDate
            deadline
            endDate
            priority
            value
            taskStatus {
                name
            }
            serviceInProgress {
                id
                startDate
                endDate
                cost
                status {
                    name
                }
                projectService {
                    service {
                        id
                        serviceName
                        estimateCost
                        serviceType {
                            name
                        }
                    }
                    project {
                        id
                        name
                        startDate
                        endDate
                        status {
                            name
                        }
                        projectType {
                            name
                        }
                        client {
                            name
                        }
                        manager {
                            name
                            surname
                        }
                    }
                }
            }
        }
    }
`;

// Material queries needed by TaskDetails component
export const MATERIALS_BY_TASK = gql`
    query GetMaterialsByTask($taskId: ID!) {
        materialsByTask(taskId: $taskId) {
            id
            name
            description
            status { name }
            language { name }
            keywords { name }
        }
    }
`;

export const DELETE_MATERIAL = gql`
    mutation DeleteMaterial($id: ID!) {
        deleteMaterial(id: $id)
    }
`;

// Other material-related queries and mutations
export const CREATE_MATERIAL = gql`
    mutation CreateMaterial($input: CreateMaterialInput!) {
        createMaterial(input: $input) {
            id
            name
        }
    }
`;

export const UPDATE_MATERIAL = gql`
    mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {
        updateMaterial(id: $id, input: $input) {
            id
            name
        }
    }
`;

export const GET_MATERIAL_BY_ID = gql`
    query GetMaterialById($id: ID!) {
        material(id: $id) {
            id
            name
            description
            type { id }
            licenceType { id }
            usageRestriction { id }
            targetAudience { id }
            language { id }
        }
    }
`;

export const GET_MATERIAL_REFERENCE_DATA = gql`
    query GetMaterialReferenceData {
        materialTypes { id name }
        licenceTypes { id name }
        usageRestrictions { id description }
        targetAudiences { id name }
        languages { id name }
    }
`;

export const REVIEWS_BY_MATERIAL = gql`
    query GetReviewsByMaterial($materialId: ID!) {
        reviewsByMaterial(materialId: $materialId) {
            id
            comments
            suggestedChange
            reviewDate
            createDatetime
            reviewer {
                id
                name
                surname
            }
        }
    }
`;