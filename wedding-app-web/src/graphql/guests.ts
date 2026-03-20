import { gql } from "@apollo/client";

export const GUESTS_BY_WEDDING = gql`
  query GuestsByWedding($weddingId: ID!) {
    guestsByWedding(weddingId: $weddingId) {
      id
      firstName
      lastName
      email
      rsvpStatus
      invitationToken
    }
  }
`;

export const ADD_GUEST = gql`
  mutation AddGuest($input: AddGuestInput!) {
    addGuest(input: $input) {
      id
      firstName
      lastName
      email
      rsvpStatus
      invitationToken
    }
  }
`;

export const SEND_INVITATION = gql`
  mutation SendInvitation($guestId: ID!) {
    sendInvitation(guestId: $guestId) {
      id
      firstName
      lastName
    }
  }
`;

export const SEND_ALL_INVITATIONS = gql`
  mutation SendAllInvitations($weddingId: ID!) {
    sendAllInvitations(weddingId: $weddingId) {
      id
      firstName
      lastName
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

export const DELETE_GUEST = gql`
  mutation DeleteGuest($guestId: ID!) {
    deleteGuest(guestId: $guestId)
  }
`;