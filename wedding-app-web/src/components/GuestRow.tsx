"use client";

import { useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GUEST_PREFERENCES } from "@/graphql/guests";
import { Guest, GuestPreferencesResponse } from "@/graphql/types";

type GuestRowProps = {
  guest: Guest;
  statusColor: Record<string, string>;
  onSendInvitation: (guestId: string, guestName: string) => void;
  onDeleteGuest: (guestId: string, guestName: string) => void;
};

export default function GuestRow({
  guest,
  statusColor,
  onSendInvitation,
  onDeleteGuest,
}: GuestRowProps) {
  const [expanded, setExpanded] = useState(false);

  const [fetchPreferences, { data: prefsData, loading: prefsLoading }] =
    useLazyQuery<GuestPreferencesResponse>(GUEST_PREFERENCES);

  const handleToggle = () => {
    if (!expanded && !prefsData) {
      fetchPreferences({ variables: { token: guest.invitationToken } });
    }
    setExpanded(!expanded);
  };

  const prefs = prefsData?.guestPreferences;
  const hasPreferences =
    prefs &&
    (prefs.foodPreference ||
      prefs.drinkPreference ||
      prefs.musicPreference ||
      prefs.dietaryRestrictions ||
      prefs.additionalNotes);

  return (
    <>
      <tr
        onClick={handleToggle}
        className="cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <td className="px-6 py-4 text-sm">
          <span className="mr-2 text-gray-400">{expanded ? "▼" : "▶"}</span>
          {guest.firstName} {guest.lastName}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">{guest.email}</td>
        <td className="px-6 py-4">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[guest.rsvpStatus]}`}
          >
            {guest.rsvpStatus}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSendInvitation(
                  guest.id,
                  `${guest.firstName} ${guest.lastName}`,
                );
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Send Invitation
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGuest(guest.id, `${guest.firstName} ${guest.lastName}`);
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={4} className="px-6 py-4 bg-gray-50">
            {prefsLoading ? (
              <p className="text-sm text-gray-400">Loading preferences...</p>
            ) : !hasPreferences ? (
              <p className="text-sm text-gray-400">
                No preferences submitted yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {prefs.foodPreference && (
                  <div>
                    <span className="font-medium text-gray-700">Food: </span>
                    <span className="text-gray-600">
                      {prefs.foodPreference}
                    </span>
                  </div>
                )}
                {prefs.drinkPreference && (
                  <div>
                    <span className="font-medium text-gray-700">Drink: </span>
                    <span className="text-gray-600">
                      {prefs.drinkPreference}
                    </span>
                  </div>
                )}
                {prefs.musicPreference && (
                  <div>
                    <span className="font-medium text-gray-700">Music: </span>
                    <span className="text-gray-600">
                      {prefs.musicPreference}
                    </span>
                  </div>
                )}
                {prefs.dietaryRestrictions && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Dietary Restrictions:{" "}
                    </span>
                    <span className="text-gray-600">
                      {prefs.dietaryRestrictions}
                    </span>
                  </div>
                )}
                {prefs.additionalNotes && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Notes: </span>
                    <span className="text-gray-600">
                      {prefs.additionalNotes}
                    </span>
                  </div>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
