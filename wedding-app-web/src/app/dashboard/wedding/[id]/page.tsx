"use client";

import { useState, useReducer } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useParams } from "next/navigation";
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
  UpdateWeddingInput,
  UpdateWeddingResponse,
} from "@/graphql/types";
import GuestRow from "@/components/GuestRow";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SkeletonDetail, SkeletonTable } from "@/components/Skeleton";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/ToastContext";

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
  themeColor: "#3498db",
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
    default:
      return state;
  }
}

export default function WeddingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestForm, dispatch] = useReducer(guestFormReducer, initialGuestForm);
  const [editing, setEditing] = useState(false);
  const [editForm, editDispatch] = useReducer(
    weddingEditReducer,
    initialWeddingEdit,
  );
  const { showToast } = useToast();

  const [updateWedding, { loading: updatingWedding }] = useMutation<
    UpdateWeddingResponse,
    { input: UpdateWeddingInput }
  >(UPDATE_WEDDING, {
    refetchQueries: [{ query: MY_WEDDINGS }],
  });

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
          themeColor: wedding.themeColor ?? "#3498db",
        },
      });
      setEditing(true);
    }
  };

  const handleUpdateWedding = async (e: React.SubmitEvent) => {
    e.preventDefault();

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

  const handleAddGuest = async (e: React.SubmitEvent) => {
    e.preventDefault();

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Something went wrong. Please try again.", "error");
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

  const guests = guestsData?.guestsByWedding ?? [];
  const acceptedCount = guests.filter(
    (g) => g.rsvpStatus === "ACCEPTED",
  ).length;
  const declinedCount = guests.filter(
    (g) => g.rsvpStatus === "DECLINED",
  ).length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === "PENDING").length;

  const statusColor = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    DECLINED: "bg-red-100 text-red-800",
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {!wedding && !editing && <SkeletonDetail />}
          {wedding && !editing && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{wedding.title}</h1>
                  <p className="text-gray-500 mt-1">
                    {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-gray-600 mt-1">{wedding.venue}</p>
                  {wedding.venueAddress && (
                    <p className="text-gray-400 text-sm mt-1">
                      {wedding.venueAddress}
                    </p>
                  )}
                  {wedding.description && (
                    <p className="text-gray-500 mt-3">{wedding.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {wedding.themeColor && (
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: wedding.themeColor }}
                    />
                  )}
                  <button
                    onClick={handleStartEditing}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {editing && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Edit Wedding</h2>
              <form onSubmit={handleUpdateWedding} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue Address
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Invitation Message
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme Color
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
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">
                      {editForm.themeColor}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={updatingWedding}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                  >
                    {updatingWedding ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <h2 className="text-xl font-bold">
                Guest List ({guests.length})
              </h2>
              <div className="flex gap-3 text-sm">
                <span className="text-green-600">{acceptedCount} accepted</span>
                <span className="text-yellow-600">{pendingCount} pending</span>
                <span className="text-red-600">{declinedCount} declined</span>
              </div>
            </div>
            <div className="flex gap-3">
              {guests.length > 0 && (
                <button
                  onClick={handleSendAll}
                  disabled={sendingAll}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors text-sm"
                >
                  {sendingAll ? "Sending..." : "Send All Invitations"}
                </button>
              )}
              <button
                onClick={() => setShowGuestForm(!showGuestForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                {showGuestForm ? "Cancel" : "Add Guest"}
              </button>
            </div>
          </div>

          {showGuestForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <form onSubmit={handleAddGuest} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addingGuest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {addingGuest ? "Adding..." : "Add Guest"}
                </button>
              </form>
            </div>
          )}

          {guestsLoading ? (
            <SkeletonTable rows={4} />
          ) : guests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No guests added yet.</p>
            </div>
          ) : (
            <div>
              <div className="hidden sm:block bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        RSVP
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
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

              <div className="sm:hidden space-y-3">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="bg-white rounded-lg shadow-md p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{guest.email}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[guest.rsvpStatus]}`}
                      >
                        {guest.rsvpStatus}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() =>
                          handleSendInvitation(
                            guest.id,
                            `${guest.firstName} ${guest.lastName}`,
                          )
                        }
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Send Invitation
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteGuest(
                            guest.id,
                            `${guest.firstName} ${guest.lastName}`,
                          )
                        }
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
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
