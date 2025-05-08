// src/features/materials/material-review-graphql/queries.js
import { gql } from '@apollo/client';

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

export const REVIEWS_BY_MATERIAL = gql`
    query GetReviewsByMaterial($materialId: ID!) {
        reviewsByMaterial(materialId: $materialId) {
            id
            comments
            suggestedChange
            reviewDate
            createDatetime
            reviewer {
                id
                name
                surname
            }
        }
    }
`;

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
        }
    }
`;