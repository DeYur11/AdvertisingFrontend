// src/pages/ServiceTracker/material-review-graphql/mutations.js
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
        }
    }
`;