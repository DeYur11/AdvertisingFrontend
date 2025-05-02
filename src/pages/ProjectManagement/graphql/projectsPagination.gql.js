import { gql } from "@apollo/client";

export const GET_PAGINATED_PROJECTS_WITH_TOTAL = gql`
    query GetPaginatedProjectsWithTotal($page: Int!, $size: Int!) {
        paginatedProjects(page: $page, size: $size) {
            content {
                id
                name
                startDate
                endDate
                cost
                estimateCost
                status {
                    id
                    name
                }
                projectType {
                    id
                    name
                }
                paymentDeadline
                client {
                    id
                    name
                }
                manager {
                    id
                    name
                    surname
                }
                description
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
