import { gql } from "@apollo/client";

/* ── довідники ───────────────────────────────────────────── */
export const GET_PROJECT_REFERENCE_DATA = gql`
    query GetProjectReferenceData {
        clients       { id name }
        projectTypes  { id name }
        projectStatuses { id name }
        services      { id serviceName estimateCost }
        workers: workersByPosition(position: "project manager") { id name surname }
    }
`;

/* ── мутації ─────────────────────────────────────────────── */
export const CREATE_PROJECT = gql`
    mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) { id name }
    }
`;

export const CREATE_PROJECT_SERVICE = gql`
    mutation CreateProjectService($input: CreateProjectServiceInput!) {
        createProjectService(input: $input) { id }
    }
`;

/* (опційно) мутації для довідників — якщо треба дозволити створювати on-the-fly */
export const CREATE_CLIENT = gql`
    mutation($input: CreateClientInput!) {
        createClient(input: $input) { id name }
    }
`;
export const CREATE_PROJECT_TYPE = gql`
    mutation($input: CreateProjectTypeInput!) {
        createProjectType(input: $input) { id name }
    }
`;
