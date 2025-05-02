// projects.gql.js
import { gql } from "@apollo/client";

export const GET_PROJECTS_SHALLOW = gql`
    query GetProjects {
        projects {
            id
            name
            startDate
            endDate
            projectType { name }
            client { id name }
            manager { name surname }
            status { name }
        }
    }
`;

export const GET_SERVICES_IN_PROGRESS_BY_PS = gql`
    query GetServicesInProgressByProjectService($projectServiceId: ID!) {
        servicesInProgressByProjectService(projectServiceId: $projectServiceId) {
            id
            cost
            status {
                name
            }
        }
    }
`;

export const GET_PROJECT_SERVICES = gql`
    query GetProjectServices($projectId: ID!) {
        projectServicesByProject(projectId: $projectId) {
            id
            amount
            service {
                id
                serviceName
                estimateCost
                serviceType { id name }
            }
            servicesInProgress {   # достатньо id+cost+status
                id
                cost
                status { name }
            }
        }
    }
`;

export const GET_SERVICES_IN_PROGRESS = gql`
    query GetSIPs($projectServiceId: ID!) {
        serviceInProgress(id: $projectServiceId) {   # або власний resolver
            id
            startDate
            endDate
            cost
            status { name }
        }
    }
`;

export const GET_SERVICE_TASKS = gql`
query GetServiceTasks($serviceInProgressId: ID!) {
    serviceInProgress(id: $serviceInProgressId) {
        id
        tasks {
            id
            name
            description
            priority
            startDate
            endDate
            deadline
            taskStatus {
                id
                name
            }
        }
    }
}
`;