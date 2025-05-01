import { gql } from '@apollo/client';

export const GET_TASKS_BY_WORKER = gql`
    query GetTasksByWorker($workerId: ID!) {
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


export const MATERIALS_BY_TASK = gql`
    query MaterialsByTask($taskId: ID!) {
        materials(taskId: $taskId) {
            id
            name
            type
        }
    }
`;

export const DELETE_MATERIAL = gql`
    mutation DeleteMaterial($id: ID!) {
        deleteMaterial(id: $id) {
            success
            message
        }
    }
`;
