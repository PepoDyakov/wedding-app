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
        className="cursor-pointer hover:bg-[#FAF7F2] transition-colors duration-200 border-b border-[#F8F4EF]"
      >
        <td className="px-6 py-4 text-sm text-[#2D2D2D]">
          <span className="mr-2 text-[#D0C8BE] text-xs">
            {expanded ? "▼" : "▶"}
          </span>
          {guest.firstName} {guest.lastName}
        </td>
        <td className="px-6 py-4 text-sm text-[#A09890]">{guest.email}</td>
        <td className="px-6 py-4">
          <span
            className={`px-3 py-1 text-[10px] font-medium ${statusColor[guest.rsvpStatus]}`}
          >
            {guest.rsvpStatus}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSendInvitation(
                  guest.id,
                  `${guest.firstName} ${guest.lastName}`,
                );
              }}
              className="text-xs text-[#B89B7A] hover:text-[#2D2D2D] transition-colors duration-300"
            >
              Send
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGuest(guest.id, `${guest.firstName} ${guest.lastName}`);
              }}
              className="text-xs text-[#D0C8BE] hover:text-[#A04040] transition-colors duration-300"
            >
              Remove
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={4} className="px-6 py-5 bg-[#FAF7F2]">
            {prefsLoading ? (
              <p className="text-sm text-[#C8B8A4]">Loading preferences...</p>
            ) : !hasPreferences ? (
              <p className="text-sm text-[#C8B8A4]">
                No preferences submitted yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {prefs.foodPreference && (
                  <div>
                    <span className="text-[10px] text-[#A09890] uppercase tracking-wider">
                      Food
                    </span>
                    <p className="text-[#2D2D2D] mt-0.5">
                      {prefs.foodPreference}
                    </p>
                  </div>
                )}
                {prefs.drinkPreference && (
                  <div>
                    <span className="text-[10px] text-[#A09890] uppercase tracking-wider">
                      Drink
                    </span>
                    <p className="text-[#2D2D2D] mt-0.5">
                      {prefs.drinkPreference}
                    </p>
                  </div>
                )}
                {prefs.musicPreference && (
                  <div>
                    <span className="text-[10px] text-[#A09890] uppercase tracking-wider">
                      Music
                    </span>
                    <p className="text-[#2D2D2D] mt-0.5">
                      {prefs.musicPreference}
                    </p>
                  </div>
                )}
                {prefs.dietaryRestrictions && (
                  <div>
                    <span className="text-[10px] text-[#A09890] uppercase tracking-wider">
                      Dietary restrictions
                    </span>
                    <p className="text-[#2D2D2D] mt-0.5">
                      {prefs.dietaryRestrictions}
                    </p>
                  </div>
                )}
                {prefs.additionalNotes && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-[#A09890] uppercase tracking-wider">
                      Notes
                    </span>
                    <p className="text-[#2D2D2D] mt-0.5">
                      {prefs.additionalNotes}
                    </p>
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
