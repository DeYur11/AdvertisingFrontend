// src/features/materials/graphql/mutations.js
import { gql } from '@apollo/client';

export const DELETE_MATERIAL = gql`
    mutation DeleteMaterial($id: ID!) {
        deleteMaterial(id: $id)
    }
`;

export const CREATE_MATERIAL = gql`
    mutation CreateMaterial($input: CreateMaterialInput!) {
        createMaterial(input: $input) {
            id
            name
        }
    }
`;

export const UPDATE_MATERIAL = gql`
    mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {
        updateMaterial(id: $id, input: $input) {
            id
            name
        }
    }
`;

export const CREATE_MATERIAL_TYPE = gql`
    mutation($input: CreateMaterialTypeInput!) {
        createMaterialType(input: $input) {
            id
            name
        }
    }
`;

export const CREATE_LICENCE_TYPE = gql`
    mutation($input: CreateLicenceTypeInput!) {
        createLicenceType(input: $input) {
            id
            name
        }
    }
`;

export const CREATE_USAGE_RESTRICTION = gql`
    mutation($input: CreateUsageRestrictionInput!) {
        createUsageRestriction(input: $input) {
            id
            description
        }
    }
`;

export const CREATE_TARGET_AUDIENCE = gql`
    mutation($input: CreateTargetAudienceInput!) {
        createTargetAudience(input: $input) {
            id
            name
        }
    }
`;

export const CREATE_LANGUAGE = gql`
    mutation($input: CreateLanguageInput!) {
        createLanguage(input: $input) {
            id
            name
        }
    }
`;

export const CREATE_KEYWORD = gql`
    mutation($input: CreateKeywordInput!) {
        createKeyword(input: $input) {
            id
            name
        }
    }
`;