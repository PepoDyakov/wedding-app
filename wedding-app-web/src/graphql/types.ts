// ----- User --------
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AuthPayload = {
  token: string;
  user: User;
};

export type LoginUserResponse = {
  loginUser: AuthPayload;
};

export type RegisterUserResponse = {
  registerUser: AuthPayload;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export type RegisterUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type MeResponse = {
  me: User | null;
};

// ---- Weddings -------

export type Wedding = {
  id: string;
  title: string;
  description: string | null;
  weddingDate: string;
  venue: string;
  venueAddress: string | null;
  customMessage: string | null;
  themeColor: string | null;
};

export type MyWeddingsResponse = {
  myWeddings: Wedding[];
};

export type CreateWeddingResponse = {
  createWedding: Wedding;
};

export type CreateWeddingInput = {
  title: string;
  description?: string;
  weddingDate: string;
  venue: string;
  venueAddress?: string;
  customMessage?: string;
  themeColor?: string;
};

export type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  invitationToken: string;
};

export type GuestsByWeddingResponse = {
  guestsByWedding: Guest[];
};

export type AddGuestResponse = {
  addGuest: Guest;
};

export type AddGuestInput = {
  weddingId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type SendInvitationResponse = {
  sendInvitation: Guest;
};

export type SendAllInvitationsResponse = {
  sendAllInvitations: Guest[];
};

export type GuestWithWedding = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  wedding: {
    title: string;
    weddingDate: string;
    venue: string;
    venueAddress: string | null;
    customMessage: string | null;
    themeColor: string | null;
  };
};

export type GuestByTokenResponse = {
  guestByToken: GuestWithWedding | null;
};

export type RespondToInvitationResponse = {
  respondToInvitation: {
    id: string;
    rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  };
};

export type GuestPreference = {
  id: string;
  foodPreference: string | null;
  drinkPreference: string | null;
  musicPreference: string | null;
  dietaryRestrictions: string | null;
  additionalNotes: string | null;
};

export type GuestPreferencesResponse = {
  guestPreferences: GuestPreference | null;
};

export type SubmitPreferencesResponse = {
  submitPreferences: GuestPreference;
};

export type SubmitPreferencesInput = {
  token: string;
  foodPreference?: string;
  drinkPreference?: string;
  musicPreference?: string;
  dietaryRestrictions?: string;
  additionalNotes?: string;
};

export type UpdateWeddingInput = {
  id: string;
  title: string;
  description?: string;
  weddingDate: string;
  venue: string;
  venueAddress?: string;
  customMessage?: string;
  themeColor?: string;
};

export type UpdateWeddingResponse = {
  updateWedding: Wedding;
};

export type DeleteWeddingResponse = {
  deleteWedding: boolean;
};

export type DeleteGuestResponse = {
  deleteGuest: boolean;
};

export type RequestPasswordResetResponse = {
  requestPasswordReset: boolean;
};

export type ResetPasswordResponse = {
  resetPassword: boolean;
};