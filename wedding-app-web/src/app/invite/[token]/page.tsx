"use client";

import { useReducer, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useParams } from "next/navigation";
import {
  GUEST_BY_TOKEN,
  RESPOND_TO_INVITATION,
  SUBMIT_PREFERENCES,
  GUEST_PREFERENCES,
} from "@/graphql/invitation";
import {
  GuestByTokenResponse,
  RespondToInvitationResponse,
  GuestPreferencesResponse,
  SubmitPreferencesResponse,
  SubmitPreferencesInput,
} from "@/graphql/types";
import { SkeletonDetail } from "@/components/Skeleton";
import { useToast } from "@/lib/ToastContext";

type PreferencesFormState = {
  foodPreference: string;
  drinkPreference: string;
  musicPreference: string;
  dietaryRestrictions: string;
  additionalNotes: string;
};

const initialPreferencesForm: PreferencesFormState = {
  foodPreference: "",
  drinkPreference: "",
  musicPreference: "",
  dietaryRestrictions: "",
  additionalNotes: "",
};

type PreferencesAction =
  | {
      type: "UPDATE_FIELD";
      field: keyof PreferencesFormState;
      value: string;
    }
  | { type: "SET_ALL"; values: PreferencesFormState };

function preferencesReducer(
  state: PreferencesFormState,
  action: PreferencesAction,
): PreferencesFormState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ALL":
      return action.values;
  }
}

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();

  const [prefForm, dispatch] = useReducer(
    preferencesReducer,
    initialPreferencesForm,
  );
  const { showToast } = useToast();

  const { data, loading } = useQuery<GuestByTokenResponse>(GUEST_BY_TOKEN, {
    variables: { token },
  });

  const { data: prefsData } = useQuery<GuestPreferencesResponse>(
    GUEST_PREFERENCES,
    {
      variables: { token },
    },
  );

  useEffect(() => {
    if (prefsData?.guestPreferences) {
      dispatch({
        type: "SET_ALL",
        values: {
          foodPreference: prefsData.guestPreferences.foodPreference ?? "",
          drinkPreference: prefsData.guestPreferences.drinkPreference ?? "",
          musicPreference: prefsData.guestPreferences.musicPreference ?? "",
          dietaryRestrictions:
            prefsData.guestPreferences.dietaryRestrictions ?? "",
          additionalNotes: prefsData.guestPreferences.additionalNotes ?? "",
        },
      });
    }
  }, [prefsData]);

  const [respondToInvitation] = useMutation<
    RespondToInvitationResponse,
    { token: string; status: string }
  >(RESPOND_TO_INVITATION, {
    refetchQueries: [{ query: GUEST_BY_TOKEN, variables: { token } }],
  });

  const [submitPreferences, { loading: submittingPrefs }] = useMutation<
    SubmitPreferencesResponse,
    { input: SubmitPreferencesInput }
  >(SUBMIT_PREFERENCES);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
          <SkeletonDetail />
          <SkeletonDetail />
          <SkeletonDetail />
        </main>
      </div>
    );
  }

  if (!data?.guestByToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Invitation Not Found
          </h1>
          <p className="text-gray-500">
            This invitation link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  const guest = data.guestByToken;
  const wedding = guest.wedding;
  const themeColor = wedding.themeColor ?? "#3498db";

  const handleRsvp = async (status: "ACCEPTED" | "DECLINED") => {
    try {
      await respondToInvitation({ variables: { token, status } });
      showToast(
        status === "ACCEPTED"
          ? "Thank you! We can't wait to see you there!"
          : "We're sorry you can't make it. Thank you for letting us know.",
        "success",
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Something went wrong. Please try again.", "error");
      }
    }
  };

  const handleSubmitPreferences = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      await submitPreferences({
        variables: {
          input: {
            token,
            foodPreference: prefForm.foodPreference || undefined,
            drinkPreference: prefForm.drinkPreference || undefined,
            musicPreference: prefForm.musicPreference || undefined,
            dietaryRestrictions: prefForm.dietaryRestrictions || undefined,
            additionalNotes: prefForm.additionalNotes || undefined,
          },
        },
      });
      showToast("Your preferences have been saved. Thank you!", "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Something went wrong. Please try again.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: themeColor }}>
            {wedding.title}
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-gray-600 mt-1">{wedding.venue}</p>
          {wedding.venueAddress && (
            <p className="text-gray-400 text-sm mt-1">{wedding.venueAddress}</p>
          )}
          {wedding.customMessage && (
            <p
              className="mt-6 italic text-gray-600 border-l-4 pl-4 text-left"
              style={{ borderColor: themeColor }}
            >
              {wedding.customMessage}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Hello, {guest.firstName}!
          </h2>

          {guest.rsvpStatus !== "PENDING" ? (
            <div className="text-sm text-gray-600">
              <p>
                You have already responded:{" "}
                <span
                  className={`font-semibold ${guest.rsvpStatus === "ACCEPTED" ? "text-green-600" : "text-red-600"}`}
                >
                  {guest.rsvpStatus === "ACCEPTED"
                    ? "Attending"
                    : "Not Attending"}
                </span>
              </p>
              <p className="mt-2 text-gray-400">
                You can change your response below.
              </p>
            </div>
          ) : (
            <p className="text-gray-600 mb-4">Will you be joining us?</p>
          )}

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleRsvp("ACCEPTED")}
              className="flex-1 py-3 rounded-md text-white font-medium transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              Accept
            </button>
            <button
              onClick={() => handleRsvp("DECLINED")}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4">Your Preferences</h2>
          <p className="text-sm text-gray-500 mb-6">
            Help us make this celebration special for you.
          </p>

          <form onSubmit={handleSubmitPreferences} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Preference
              </label>
              <input
                type="text"
                value={prefForm.foodPreference}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "foodPreference",
                    value: e.target.value,
                  })
                }
                placeholder="e.g. Vegetarian, no shellfish..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drink Preference
              </label>
              <input
                type="text"
                value={prefForm.drinkPreference}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "drinkPreference",
                    value: e.target.value,
                  })
                }
                placeholder="e.g. Red wine, non-alcoholic..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Music Preference
              </label>
              <input
                type="text"
                value={prefForm.musicPreference}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "musicPreference",
                    value: e.target.value,
                  })
                }
                placeholder="e.g. Jazz, 80s pop, anything danceable..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Restrictions
              </label>
              <textarea
                value={prefForm.dietaryRestrictions}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "dietaryRestrictions",
                    value: e.target.value,
                  })
                }
                placeholder="Any allergies or dietary needs..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={prefForm.additionalNotes}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "additionalNotes",
                    value: e.target.value,
                  })
                }
                placeholder="Anything else you'd like us to know..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingPrefs}
              className="w-full py-2 px-4 text-white rounded-md transition-colors disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {submittingPrefs ? "Saving..." : "Save Preferences"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
