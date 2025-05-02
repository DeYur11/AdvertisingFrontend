import { gql } from "@apollo/client";

export const GET_ALL_SERVICES = gql`
    query GetAllServices {
        services {
            id
            serviceName
            estimateCost
            serviceType { id name }
        }
    }
`;

export const CREATE_PROJECT_SERVICE = gql`
    mutation AddProjectService(
        $projectId: ID!
        $serviceId: ID!
        $amount: Int!
    ) {
        createProjectService(
            input: { projectId: $projectId, serviceId: $serviceId, amount: $amount }
        ) {
            id
            amount
            service {
                id
                serviceName
                estimateCost
                serviceType { id name }
            }
            servicesInProgress {
                id
                cost
                status { id name }
            }
        }
    }
`;
