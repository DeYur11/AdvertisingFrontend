import { gql } from "@apollo/client";

export const CREATE_MATERIAL_TYPE = gql`
  mutation CreateMaterialType($input: CreateMaterialTypeInput!) {
    createMaterialType(input: $input) {
      id
      name
    }
  }
`;

export const CREATE_TARGET_AUDIENCE = gql`
  mutation CreateTargetAudience($input: CreateTargetAudienceInput!) {
    createTargetAudience(input: $input) {
      id
      name
    }
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
