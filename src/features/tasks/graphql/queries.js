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