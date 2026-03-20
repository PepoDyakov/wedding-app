"use client";

import { useReducer, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import {
  MY_WEDDINGS,
  CREATE_WEDDING,
  DELETE_WEDDING,
} from "@/graphql/weddings";
import {
  MyWeddingsResponse,
  CreateWeddingResponse,
  CreateWeddingInput,
  DeleteWeddingResponse,
} from "@/graphql/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SkeletonCard } from "@/components/Skeleton";
import Header from "@/components/Header";
import { useToast } from "@/lib/ToastContext";

type WeddingFormState = {
  title: string;
  description: string;
  weddingDate: string;
  venue: string;
  venueAddress: string;
  customMessage: string;
  themeColor: string;
};

const initialFormState: WeddingFormState = {
  title: "",
  description: "",
  weddingDate: "",
  venue: "",
  venueAddress: "",
  customMessage: "",
  themeColor: "#3498db",
};

type FormAction =
  | { type: "UPDATE_FIELD"; field: keyof WeddingFormState; value: string }
  | { type: "RESET" };

function formReducer(
  state: WeddingFormState,
  action: FormAction,
): WeddingFormState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialFormState;
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [form, dispatch] = useReducer(formReducer, initialFormState);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const { data, loading: queryLoading } =
    useQuery<MyWeddingsResponse>(MY_WEDDINGS);

  const [createWedding, { loading: mutationLoading }] = useMutation<
    CreateWeddingResponse,
    { input: CreateWeddingInput }
  >(CREATE_WEDDING, {
    refetchQueries: [{ query: MY_WEDDINGS }],
  });

  const [deleteWedding] = useMutation<DeleteWeddingResponse, { id: string }>(
    DELETE_WEDDING,
    {
      refetchQueries: [{ query: MY_WEDDINGS }],
    },
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createWedding({
        variables: {
          input: {
            title: form.title,
            weddingDate: form.weddingDate,
            venue: form.venue,
            description: form.description || undefined,
            venueAddress: form.venueAddress || undefined,
            customMessage: form.customMessage || undefined,
            themeColor: form.themeColor || undefined,
          },
        },
      });

      setShowForm(false);
      dispatch({ type: "RESET" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    weddingId: string,
    weddingTitle: string,
  ) => {
    e.stopPropagation();

    if (
      !window.confirm(
        `Are you sure you want to delete "${weddingTitle}"? This will also remove all guests and their data.`,
      )
    ) {
      return;
    }

    try {
      await deleteWedding({ variables: { id: weddingId } });
      showToast(`"${weddingTitle}" has been deleted.`, "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to delete wedding.", "error");
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Weddings</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showForm ? "Cancel" : "Create Wedding"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">New Wedding</h3>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "title",
                        value: e.target.value,
                      })
                    }
                    placeholder="John & Jane's Wedding"
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
                      value={form.weddingDate}
                      onChange={(e) =>
                        dispatch({
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
                      value={form.venue}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "venue",
                          value: e.target.value,
                        })
                      }
                      placeholder="Rose Garden Estate"
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
                    value={form.venueAddress}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "venueAddress",
                        value: e.target.value,
                      })
                    }
                    placeholder="123 Garden Lane, City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "description",
                        value: e.target.value,
                      })
                    }
                    placeholder="A brief description of your wedding..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Invitation Message
                  </label>
                  <textarea
                    value={form.customMessage}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "customMessage",
                        value: e.target.value,
                      })
                    }
                    placeholder="We would be honored to have you celebrate with us!"
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
                      value={form.themeColor}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "themeColor",
                          value: e.target.value,
                        })
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">
                      {form.themeColor}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={mutationLoading}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {mutationLoading ? "Creating..." : "Create Wedding"}
                </button>
              </form>
            </div>
          )}

          {queryLoading ? (
            <div className="grid gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : data?.myWeddings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 mb-4">
                You haven&apos;t created any weddings yet.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:underline"
              >
                Create your first wedding
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {data?.myWeddings.map((wedding) => (
                <div
                  key={wedding.id}
                  onClick={() =>
                    router.push(`/dashboard/wedding/${wedding.id}`)
                  }
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{wedding.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(wedding.weddingDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {wedding.venue}
                      </p>
                      {wedding.description && (
                        <p className="text-sm text-gray-400 mt-2">
                          {wedding.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {wedding.themeColor && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: wedding.themeColor }}
                        />
                      )}
                      <button
                        onClick={(e) =>
                          handleDelete(e, wedding.id, wedding.title)
                        }
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
