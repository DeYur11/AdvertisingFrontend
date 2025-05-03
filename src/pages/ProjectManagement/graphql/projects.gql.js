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


export const GET_PROJECT_PAYMENTS = gql`
    query GetProjectPayments($projectId: ID!) {
        paymentsByProject(projectId: $projectId) {
            id
            transactionNumber
            paymentSum
            paymentDate
            paymentPurpose {
                name
                id
            }
            createDatetime
            updateDatetime
        }
    }
`;
export const CREATE_PAYMENT = gql`
    mutation CreatePayment($input: CreatePaymentInput!) {
        createPayment(input: $input) {
            id
            transactionNumber
            paymentSum
            paymentDate
        }
    }
`;

export const DELETE_PAYMENT = gql`
    mutation DeletePayment($id: ID!) {
        deletePayment(id: $id)
    }
`;

export const GET_PAYMENT_PURPOSES = gql`
    query GetPaymentPurposes {
        paymentPurposes {
            id
            name
        }
    }
`;

export const UPDATE_PAYMENT = gql`
    mutation UpdatePayment($id: ID!, $amount: Float!, $paymentDate: DateTime!, $description: String) {
        updatePayment(
            id: $id,
            input: {
                amount: $amount,
                paymentDate: $paymentDate,
                description: $description
            }
        ) {
            id
            amount
            paymentDate
            description
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