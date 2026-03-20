import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
    mutation RegisterUser($input: RegisterUserInput!) {
        registerUser(input: $input) {
            token
            user {
                id
                firstName
                lastName
                email
            }
        }
    }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginUserInput!) {
    loginUser(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      firstName
      lastName
      email
    }
  }
`;

