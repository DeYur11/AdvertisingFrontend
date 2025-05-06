// src/pages/ServiceTracker/graphql/mutations.js
import { gql } from "@apollo/client";

// Mutation to create a new service in progress with correct field names
export const CREATE_SERVICE_IN_PROGRESS = gql`
    mutation CreateServiceInProgress($input: CreateServiceInProgressInput!) {
        createServiceInProgress(input: $input) {
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
`;

// Mutation to update an existing service in progress
export const UPDATE_SERVICE_IN_PROGRESS = gql`
    mutation UpdateServiceInProgress($id: ID!, $input: UpdateServiceInProgressInput!) {
        updateServiceInProgress(id: $id, input: $input) {
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
`;

// Mutation to delete a service in progress
export const DELETE_SERVICE_IN_PROGRESS = gql`
    mutation DeleteServiceInProgress($id: ID!) {
        deleteServiceInProgress(id: $id)
    }
`;

// Mutation to create a new task
export const CREATE_TASK = gql`
    mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
            id
            name
            description
            deadline
            priority
            value
            taskStatus {
                id
                name
            }
            assignedWorker {
                id
                name
                surname
            }
        }
    }
`;

// Mutation to update an existing task
export const UPDATE_TASK = gql`
    mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
            id
            name
            description
            deadline
            priority
            value
            taskStatus {
                id
                name
            }
            assignedWorker {
                id
                name
                surname
            }
        }
    }
`;

// Mutation to delete a task
export const DELETE_TASK = gql`
    mutation DeleteTask($id: ID!) {
        deleteTask(id: $id)
    }
`;