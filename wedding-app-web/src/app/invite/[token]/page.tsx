"use client";

import { useReducer, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { useToast } from "@/lib/ToastContext";
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
  const { showToast } = useToast();

  const [prefForm, dispatch] = useReducer(
    preferencesReducer,
    initialPreferencesForm,
  );

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
      <div className="min-h-screen bg-[#F7F3EE]">
        <main className="max-w-lg mx-auto px-4 py-12 space-y-3">
          <SkeletonDetail />
          <SkeletonDetail />
        </main>
      </div>
    );
  }

  if (!data?.guestByToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EE]">
        <div className="bg-white border border-[#E8E0D5] p-10 text-center max-w-sm">
          <div className="w-8 h-px bg-[#D0C8BE] mx-auto mb-6" />
          <h1 className="font-serif text-xl text-[#2D2D2D] mb-3">
            Invitation not found
          </h1>
          <p className="text-sm text-[#A09890]">
            This invitation link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  const guest = data.guestByToken;
  const wedding = guest.wedding;
  const themeColor = wedding.themeColor ?? "#B89B7A";

  const handleRsvp = async (status: "ACCEPTED" | "DECLINED") => {
    try {
      await respondToInvitation({ variables: { token, status } });
      showToast(
        status === "ACCEPTED"
          ? "Thank you! We can\u2019t wait to see you there!"
          : "We\u2019re sorry you can\u2019t make it. Thank you for letting us know.",
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

  const handleSubmitPreferences = async (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-[#F7F3EE]">
      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white border border-[#E8E0D5] p-10 text-center mb-3">
          <div className="w-10 h-px bg-[#D0C8BE] mx-auto mb-6" />

          <p className="text-[9px] text-[#B89B7A] uppercase tracking-[3px] mb-6">
            You are invited
          </p>

          <h1 className="font-serif text-3xl text-[#2D2D2D] leading-tight">
            {wedding.title.split("&")[0]?.trim() ??
              wedding.title.split("and")[0]?.trim() ??
              wedding.title}
          </h1>
          <p className="font-serif text-lg text-[#D0C8BE] my-1">&</p>
          <h1 className="font-serif text-3xl text-[#2D2D2D] leading-tight">
            {wedding.title.includes("&")
              ? wedding.title
                  .split("&")[1]
                  ?.replace(/'s Wedding|'s wedding/i, "")
                  .trim()
              : wedding.title.includes("and")
                ? wedding.title
                    .split("and")[1]
                    ?.replace(/'s Wedding|'s wedding/i, "")
                    .trim()
                : ""}
          </h1>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E8E0D5]" />
            <div
              className="w-1.5 h-1.5 rotate-45"
              style={{ backgroundColor: themeColor }}
            />
            <div className="flex-1 h-px bg-[#E8E0D5]" />
          </div>

          <p className="text-sm text-[#2D2D2D] font-medium">
            {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-[#777] mt-1">{wedding.venue}</p>
          {wedding.venueAddress && (
            <p className="text-xs text-[#AAA] mt-1">{wedding.venueAddress}</p>
          )}

          {wedding.customMessage && (
            <p className="font-serif text-sm text-[#888] italic leading-relaxed mt-6 px-2">
              &ldquo;{wedding.customMessage}&rdquo;
            </p>
          )}

          <div className="mt-8">
            <p className="text-[9px] text-[#B89B7A] uppercase tracking-[2px] mb-4">
              {guest.rsvpStatus === "PENDING"
                ? "Kindly respond"
                : "Your response"}
            </p>

            {guest.rsvpStatus !== "PENDING" && (
              <p className="text-sm text-[#A09890] mb-4">
                You responded:{" "}
                <span
                  className={`font-medium ${
                    guest.rsvpStatus === "ACCEPTED"
                      ? "text-[#4A7C50]"
                      : "text-[#A04040]"
                  }`}
                >
                  {guest.rsvpStatus === "ACCEPTED"
                    ? "Attending"
                    : "Not attending"}
                </span>
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleRsvp("ACCEPTED")}
                className="flex-1 py-3 text-[#FEFCFA] text-[11px] uppercase tracking-[1.5px] hover:opacity-90 transition-opacity duration-300"
                style={{ backgroundColor: themeColor }}
              >
                Joyfully accept
              </button>
              <button
                onClick={() => handleRsvp("DECLINED")}
                className="flex-1 py-3 border border-[#E0D5C8] text-[#777] text-[11px] uppercase tracking-[1.5px] hover:border-[#2D2D2D] hover:text-[#2D2D2D] transition-all duration-300"
              >
                Respectfully decline
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E8E0D5] p-8">
          <h2 className="font-serif text-lg text-[#2D2D2D] mb-1">
            Your preferences
          </h2>
          <p className="text-xs text-[#A09890] mb-6">
            Help us make this day special for you
          </p>

          <form onSubmit={handleSubmitPreferences} className="space-y-5">
            <div>
              <label className="block text-[9px] text-[#A09890] uppercase tracking-[1px] mb-2">
                Food preference
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
                className="w-full py-2 bg-transparent border-b border-[#E8E0D5] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] text-[#A09890] uppercase tracking-[1px] mb-2">
                Drink preference
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
                className="w-full py-2 bg-transparent border-b border-[#E8E0D5] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] text-[#A09890] uppercase tracking-[1px] mb-2">
                Song request
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
                placeholder="e.g. First dance suggestion..."
                className="w-full py-2 bg-transparent border-b border-[#E8E0D5] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] text-[#A09890] uppercase tracking-[1px] mb-2">
                Dietary restrictions
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
                className="w-full py-2 bg-transparent border-b border-[#E8E0D5] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[9px] text-[#A09890] uppercase tracking-[1px] mb-2">
                Special notes
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
                placeholder="Anything we should know..."
                rows={2}
                className="w-full py-2 bg-transparent border-b border-[#E8E0D5] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingPrefs}
              className="w-full py-3 bg-[#2D2D2D] text-[#FEFCFA] text-[11px] uppercase tracking-[1.5px] hover:bg-[#B89B7A] disabled:bg-[#D0C8BE] transition-colors duration-300"
            >
              {submittingPrefs ? "Saving..." : "Save preferences"}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[#C8B8A4] tracking-wider mt-6">
          Powered by TheWeddingApp
        </p>
      </main>
    </div>
  );
}
