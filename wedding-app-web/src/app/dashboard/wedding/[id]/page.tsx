"use client";

import { useState, useReducer } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/lib/ToastContext";
import { MY_WEDDINGS, UPDATE_WEDDING } from "@/graphql/weddings";
import {
  GUESTS_BY_WEDDING,
  ADD_GUEST,
  SEND_INVITATION,
  SEND_ALL_INVITATIONS,
  DELETE_GUEST,
} from "@/graphql/guests";
import {
  MyWeddingsResponse,
  GuestsByWeddingResponse,
  AddGuestResponse,
  AddGuestInput,
  SendInvitationResponse,
  SendAllInvitationsResponse,
  DeleteGuestResponse,
  UpdateWeddingResponse,
  UpdateWeddingInput,
} from "@/graphql/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import GuestRow from "@/components/GuestRow";
import { SkeletonDetail, SkeletonTable } from "@/components/Skeleton";

type GuestFormState = {
  firstName: string;
  lastName: string;
  email: string;
};

const initialGuestForm: GuestFormState = {
  firstName: "",
  lastName: "",
  email: "",
};

type GuestFormAction =
  | { type: "UPDATE_FIELD"; field: keyof GuestFormState; value: string }
  | { type: "RESET" };

function guestFormReducer(
  state: GuestFormState,
  action: GuestFormAction,
): GuestFormState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialGuestForm;
  }
}

type WeddingEditState = {
  title: string;
  description: string;
  weddingDate: string;
  venue: string;
  venueAddress: string;
  customMessage: string;
  themeColor: string;
};

const initialWeddingEdit: WeddingEditState = {
  title: "",
  description: "",
  weddingDate: "",
  venue: "",
  venueAddress: "",
  customMessage: "",
  themeColor: "#B89B7A",
};

type WeddingEditAction =
  | { type: "UPDATE_FIELD"; field: keyof WeddingEditState; value: string }
  | { type: "SET_ALL"; values: WeddingEditState };

function weddingEditReducer(
  state: WeddingEditState,
  action: WeddingEditAction,
): WeddingEditState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ALL":
      return action.values;
  }
}

export default function WeddingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [guestForm, dispatch] = useReducer(guestFormReducer, initialGuestForm);
  const [editForm, editDispatch] = useReducer(
    weddingEditReducer,
    initialWeddingEdit,
  );

  const { data: weddingsData } = useQuery<MyWeddingsResponse>(MY_WEDDINGS);
  const wedding = weddingsData?.myWeddings.find((w) => w.id === id);

  const { data: guestsData, loading: guestsLoading } =
    useQuery<GuestsByWeddingResponse>(GUESTS_BY_WEDDING, {
      variables: { weddingId: id },
    });

  const [addGuest, { loading: addingGuest }] = useMutation<
    AddGuestResponse,
    { input: AddGuestInput }
  >(ADD_GUEST, {
    refetchQueries: [
      { query: GUESTS_BY_WEDDING, variables: { weddingId: id } },
    ],
  });

  const [sendInvitation] = useMutation<
    SendInvitationResponse,
    { guestId: string }
  >(SEND_INVITATION);

  const [sendAllInvitations, { loading: sendingAll }] = useMutation<
    SendAllInvitationsResponse,
    { weddingId: string }
  >(SEND_ALL_INVITATIONS);

  const [deleteGuest] = useMutation<DeleteGuestResponse, { guestId: string }>(
    DELETE_GUEST,
    {
      refetchQueries: [
        { query: GUESTS_BY_WEDDING, variables: { weddingId: id } },
      ],
    },
  );

  const [updateWedding, { loading: updatingWedding }] = useMutation<
    UpdateWeddingResponse,
    { input: UpdateWeddingInput }
  >(UPDATE_WEDDING, {
    refetchQueries: [{ query: MY_WEDDINGS }],
  });

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await addGuest({
        variables: {
          input: {
            weddingId: id,
            firstName: guestForm.firstName,
            lastName: guestForm.lastName,
            email: guestForm.email,
          },
        },
      });

      setShowGuestForm(false);
      dispatch({ type: "RESET" });
      showToast("Guest added successfully!", "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  const handleSendInvitation = async (guestId: string, guestName: string) => {
    try {
      await sendInvitation({ variables: { guestId } });
      showToast(`Invitation sent to ${guestName}!`, "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to send invitation.", "error");
      }
    }
  };

  const handleSendAll = async () => {
    try {
      const { data } = await sendAllInvitations({
        variables: { weddingId: id },
      });
      const count = data?.sendAllInvitations.length ?? 0;
      showToast(`Invitations sent to ${count} guests!`, "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to send invitations.", "error");
      }
    }
  };

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${guestName}?`)) {
      return;
    }

    try {
      await deleteGuest({ variables: { guestId } });
      showToast(`${guestName} has been removed.`, "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to delete guest.", "error");
      }
    }
  };

  const handleStartEditing = () => {
    if (wedding) {
      editDispatch({
        type: "SET_ALL",
        values: {
          title: wedding.title,
          description: wedding.description ?? "",
          weddingDate: wedding.weddingDate,
          venue: wedding.venue,
          venueAddress: wedding.venueAddress ?? "",
          customMessage: wedding.customMessage ?? "",
          themeColor: wedding.themeColor ?? "#B89B7A",
        },
      });
      setEditing(true);
    }
  };

  const handleUpdateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await updateWedding({
        variables: {
          input: {
            id,
            title: editForm.title,
            weddingDate: editForm.weddingDate,
            venue: editForm.venue,
            description: editForm.description || undefined,
            venueAddress: editForm.venueAddress || undefined,
            customMessage: editForm.customMessage || undefined,
            themeColor: editForm.themeColor || undefined,
          },
        },
      });
      setEditing(false);
      showToast("Wedding updated successfully!", "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Something went wrong. Please try again.", "error");
      }
    }
  };

  const guests = guestsData?.guestsByWedding ?? [];
  const acceptedCount = guests.filter(
    (g) => g.rsvpStatus === "ACCEPTED",
  ).length;
  const declinedCount = guests.filter(
    (g) => g.rsvpStatus === "DECLINED",
  ).length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === "PENDING").length;

  const statusColor = {
    PENDING: "bg-[#FDF5E8] text-[#9A7C3A]",
    ACCEPTED: "bg-[#EDF5EE] text-[#4A7C50]",
    DECLINED: "bg-[#FDF0EF] text-[#A04040]",
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FEFCFA]">
        <Header />

        <div className="max-w-5xl mx-auto px-6 pt-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-[#B89B7A] hover:text-[#2D2D2D] transition-colors duration-300 tracking-wide"
          >
            &larr; Dashboard
          </button>
        </div>

        <main className="max-w-5xl mx-auto px-6 py-6">
          {!wedding && !editing && <SkeletonDetail />}

          {wedding && !editing && (
            <div className="bg-white border border-[#F0EBE4] p-8 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="font-serif text-2xl text-[#2D2D2D]">
                    {wedding.title}
                  </h1>
                  <div className="flex gap-2 mt-2 text-sm text-[#A09890]">
                    <span>
                      {new Date(wedding.weddingDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                    <span className="text-[#D0C8BE]">&middot;</span>
                    <span>{wedding.venue}</span>
                  </div>
                  {wedding.venueAddress && (
                    <p className="text-xs text-[#C8B8A4] mt-1">
                      {wedding.venueAddress}
                    </p>
                  )}
                  {wedding.description && (
                    <p className="text-sm text-[#A09890] mt-4">
                      {wedding.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {wedding.themeColor && (
                    <div
                      className="w-3 h-3"
                      style={{ backgroundColor: wedding.themeColor }}
                    />
                  )}
                  <button
                    onClick={handleStartEditing}
                    className="text-xs text-[#B89B7A] hover:text-[#2D2D2D] transition-colors duration-300 tracking-wide uppercase"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {editing && (
            <div className="bg-white border border-[#F0EBE4] p-8 mb-8">
              <h2 className="font-serif text-xl text-[#2D2D2D] mb-6">
                Edit wedding
              </h2>

              <form onSubmit={handleUpdateWedding} className="space-y-5">
                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      editDispatch({
                        type: "UPDATE_FIELD",
                        field: "title",
                        value: e.target.value,
                      })
                    }
                    className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={editForm.weddingDate}
                      onChange={(e) =>
                        editDispatch({
                          type: "UPDATE_FIELD",
                          field: "weddingDate",
                          value: e.target.value,
                        })
                      }
                      className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                      Venue *
                    </label>
                    <input
                      type="text"
                      value={editForm.venue}
                      onChange={(e) =>
                        editDispatch({
                          type: "UPDATE_FIELD",
                          field: "venue",
                          value: e.target.value,
                        })
                      }
                      className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                    Venue address
                  </label>
                  <input
                    type="text"
                    value={editForm.venueAddress}
                    onChange={(e) =>
                      editDispatch({
                        type: "UPDATE_FIELD",
                        field: "venueAddress",
                        value: e.target.value,
                      })
                    }
                    className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      editDispatch({
                        type: "UPDATE_FIELD",
                        field: "description",
                        value: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                    Custom invitation message
                  </label>
                  <textarea
                    value={editForm.customMessage}
                    onChange={(e) =>
                      editDispatch({
                        type: "UPDATE_FIELD",
                        field: "customMessage",
                        value: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                    Theme color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editForm.themeColor}
                      onChange={(e) =>
                        editDispatch({
                          type: "UPDATE_FIELD",
                          field: "themeColor",
                          value: e.target.value,
                        })
                      }
                      className="w-10 h-10 cursor-pointer border border-[#E0D5C8]"
                    />
                    <span className="text-sm text-[#A09890]">
                      {editForm.themeColor}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={updatingWedding}
                    className="px-8 py-3 bg-[#2D2D2D] text-[#FEFCFA] text-[13px] uppercase tracking-[2px] hover:bg-[#B89B7A] disabled:bg-[#D0C8BE] transition-colors duration-300"
                  >
                    {updatingWedding ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-8 py-3 border border-[#E0D5C8] text-[#A09890] text-[13px] uppercase tracking-[2px] hover:border-[#2D2D2D] hover:text-[#2D2D2D] transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#F0EBE4] bg-white mb-8">
            <div className="py-4 text-center border-b sm:border-b-0 border-r border-[#F0EBE4]">
              <p className="font-serif text-xl text-[#2D2D2D]">
                {guests.length}
              </p>
              <p className="text-[9px] text-[#A09890] uppercase tracking-[1.5px] mt-1">
                Total
              </p>
            </div>
            <div className="py-4 text-center border-b sm:border-b-0 sm:border-r border-[#F0EBE4]">
              <p className="font-serif text-xl text-[#4A7C50]">
                {acceptedCount}
              </p>
              <p className="text-[9px] text-[#A09890] uppercase tracking-[1.5px] mt-1">
                Accepted
              </p>
            </div>
            <div className="py-4 text-center border-r border-[#F0EBE4]">
              <p className="font-serif text-xl text-[#9A7C3A]">
                {pendingCount}
              </p>
              <p className="text-[9px] text-[#A09890] uppercase tracking-[1.5px] mt-1">
                Pending
              </p>
            </div>
            <div className="py-4 text-center">
              <p className="font-serif text-xl text-[#A04040]">
                {declinedCount}
              </p>
              <p className="text-[9px] text-[#A09890] uppercase tracking-[1.5px] mt-1">
                Declined
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <p className="text-[10px] text-[#A09890] uppercase tracking-[2px]">
              Guest list
            </p>
            <div className="flex gap-2">
              {guests.length > 0 && (
                <button
                  onClick={handleSendAll}
                  disabled={sendingAll}
                  className="text-[13px] px-5 py-2 bg-[#4A7C50] text-[#FEFCFA] uppercase tracking-[1.5px] hover:bg-[#3A6340] disabled:bg-[#D0C8BE] transition-colors duration-300"
                >
                  {sendingAll ? "Sending..." : "Send all"}
                </button>
              )}
              <button
                onClick={() => setShowGuestForm(!showGuestForm)}
                className="text-[13px] px-5 py-2 bg-[#2D2D2D] text-[#FEFCFA] uppercase tracking-[1.5px] hover:bg-[#B89B7A] transition-colors duration-300"
              >
                {showGuestForm ? "Cancel" : "+ Add guest"}
              </button>
            </div>
          </div>

          {showGuestForm && (
            <div className="bg-white border border-[#F0EBE4] p-8 mb-6">
              {error && (
                <div className="bg-[#FDF0EF] text-[#A04040] px-4 py-3 text-sm mb-6 border border-[#F5D5D5]">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddGuest} className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                      First name *
                    </label>
                    <input
                      type="text"
                      value={guestForm.firstName}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "firstName",
                          value: e.target.value,
                        })
                      }
                      className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                      Last name *
                    </label>
                    <input
                      type="text"
                      value={guestForm.lastName}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "lastName",
                          value: e.target.value,
                        })
                      }
                      className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={guestForm.email}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "email",
                          value: e.target.value,
                        })
                      }
                      className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addingGuest}
                  className="px-8 py-3 bg-[#2D2D2D] text-[#FEFCFA] text-[13px] uppercase tracking-[2px] hover:bg-[#B89B7A] disabled:bg-[#D0C8BE] transition-colors duration-300"
                >
                  {addingGuest ? "Adding..." : "Add guest"}
                </button>
              </form>
            </div>
          )}

          {guestsLoading ? (
            <SkeletonTable rows={4} />
          ) : guests.length === 0 ? (
            <div className="bg-white border border-[#F0EBE4] py-16 text-center">
              <p className="font-serif text-lg text-[#2D2D2D] mb-2">
                No guests yet
              </p>
              <p className="text-sm text-[#A09890]">
                Add your first guest to get started
              </p>
            </div>
          ) : (
            <div>
              <div className="hidden sm:block bg-white border border-[#F0EBE4] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#FAF7F2]">
                      <th className="px-6 py-3 text-left text-[9px] text-[#A09890] uppercase tracking-[1.5px] font-normal border-b border-[#F0EBE4]">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-[9px] text-[#A09890] uppercase tracking-[1.5px] font-normal border-b border-[#F0EBE4]">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-[9px] text-[#A09890] uppercase tracking-[1.5px] font-normal border-b border-[#F0EBE4]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-[9px] text-[#A09890] uppercase tracking-[1.5px] font-normal border-b border-[#F0EBE4]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((guest) => (
                      <GuestRow
                        key={guest.id}
                        guest={guest}
                        statusColor={statusColor}
                        onSendInvitation={handleSendInvitation}
                        onDeleteGuest={handleDeleteGuest}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden space-y-2">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="bg-white border border-[#F0EBE4] p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-[#2D2D2D] font-medium">
                          {guest.firstName} {guest.lastName}
                        </p>
                        <p className="text-xs text-[#A09890] mt-1">
                          {guest.email}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-[10px] font-medium ${statusColor[guest.rsvpStatus]}`}
                      >
                        {guest.rsvpStatus}
                      </span>
                    </div>
                    <div className="flex gap-4 pt-3 border-t border-[#F0EBE4]">
                      <button
                        onClick={() =>
                          handleSendInvitation(
                            guest.id,
                            `${guest.firstName} ${guest.lastName}`,
                          )
                        }
                        className="text-xs text-[#B89B7A] hover:text-[#2D2D2D] transition-colors duration-300"
                      >
                        Send invitation
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteGuest(
                            guest.id,
                            `${guest.firstName} ${guest.lastName}`,
                          )
                        }
                        className="text-xs text-[#D0C8BE] hover:text-[#A04040] transition-colors duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
