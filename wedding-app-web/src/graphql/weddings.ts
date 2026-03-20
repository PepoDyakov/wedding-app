import { gql } from "@apollo/client";

export const MY_WEDDINGS = gql`
  query MyWeddings {
    myWeddings {
      id
      title
      description
      weddingDate
      venue
      venueAddress
      customMessage
      themeColor
    }
  }
`;

export const CREATE_WEDDING = gql`
  mutation CreateWedding($input: CreateWeddingInput!) {
    createWedding(input: $input) {
      id
      title
      description
      weddingDate
      venue
      venueAddress
      customMessage
      themeColor
    }
  }
`;

export const UPDATE_WEDDING = gql`
  mutation UpdateWedding($input: UpdateWeddingInput!) {
    updateWedding(input: $input) {
      id
      title
      description
      weddingDate
      venue
      venueAddress
      customMessage
      themeColor
    }
  }
`;

export const DELETE_WEDDING = gql`
  mutation DeleteWedding($id: ID!) {
    deleteWedding(id: $id)
  }
`;