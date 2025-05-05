import { gql } from '@apollo/client';

// Main query for paginated tasks by worker
export const GET_PAGINATED_TASKS_BY_WORKER = gql`
    query GetPaginatedTasksByWorker($workerId: ID!, $input: PaginatedTasksInput!) {
        paginatedTasksByWorker(workerId: $workerId, input: $input) {
            content {
                id
                name
                description
                startDate
                deadline
                endDate
                priority
                value
                createDatetime
                updateDatetime
                taskStatus {
                    id
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

// Get task details by ID
export const GET_TASK_BY_ID = gql`
    query GetTaskById($id: ID!) {
        task(id: $id) {
            id
            name
            description
            startDate
            deadline
            endDate
            priority
            value
            createDatetime
            updateDatetime
            taskStatus {
                id
                name
            }
            materials {
                id
                name
                description
                status {
                    name
                }
                language {
                    name
                }
                keywords {
                    name
                }
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

// Reference data queries for filters
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
        taskStatuses {
            id
            name
        }
        clients {
            id
            name
        }
    }
`;

// Task status transition mutation
export const TRANSITION_TASK_STATUS = gql`
    mutation TransitionTaskStatus($input: TransitionTaskStatusInput!) {
        transitionTaskStatus(input: $input) {
            id
            taskStatus {
                id
                name
            }
            updateDatetime
        }
    }
`;

// Material related queries
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

// Get material by ID for editing
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
            keywords { id name }
        }
    }
`;

// Get material reference data for forms
export const GET_MATERIAL_REFERENCE_DATA = gql`
    query GetMaterialReferenceData {
        materialTypes { id name }
        licenceTypes { id name }
        usageRestrictions { id description }
        targetAudiences { id name }
        languages { id name }
        keywords { id name }
    }
`;