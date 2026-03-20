import { gql } from "@apollo/client";

export const GUEST_BY_TOKEN = gql`
  query GuestByToken($token: String!) {
    guestByToken(token: $token) {
      id
      firstName
      lastName
      email
      rsvpStatus
      wedding {
        title
        weddingDate
        venue
        venueAddress
        customMessage
        themeColor
      }
    }
  }
`;

export const RESPOND_TO_INVITATION = gql`
  mutation RespondToInvitation($token: String!, $status: RsvpStatus!) {
    respondToInvitation(token: $token, status: $status) {
      id
      rsvpStatus
    }
  }
`;

export const SUBMIT_PREFERENCES = gql`
  mutation SubmitPreferences($input: SubmitPreferencesInput!) {
    submitPreferences(input: $input) {
      id
      foodPreference
      drinkPreference
      musicPreference
      dietaryRestrictions
      additionalNotes
    }
  }
`;

export const GUEST_PREFERENCES = gql`
  query GuestPreferences($token: String!) {
    guestPreferences(token: $token) {
      id
      foodPreference
      drinkPreference
      musicPreference
      dietaryRestrictions
      additionalNotes
    }
  }
`;