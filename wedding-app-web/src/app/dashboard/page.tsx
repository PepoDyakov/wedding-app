"use client";

import { useState, useReducer } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";
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
import Header from "@/components/Header";
import { SkeletonCard } from "@/components/Skeleton";

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
  themeColor: "#B89B7A",
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
  const { user } = useAuth();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, dispatch] = useReducer(formReducer, initialFormState);

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
      showToast("Wedding created successfully!", "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  const handleDeleteWedding = async (
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FEFCFA]">
        <Header />

        <main className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-[#2D2D2D] mb-1">
              {greeting()}, {user?.firstName}
            </h1>
            <p className="text-sm text-[#A09890]">Your wedding overview</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#F0EBE4] bg-white mb-10">
            <div className="py-5 text-center border-b sm:border-b-0 border-r border-[#F0EBE4]">
              <p className="font-serif text-2xl text-[#2D2D2D]">
                {data?.myWeddings.length ?? 0}
              </p>
              <p className="text-[10px] text-[#A09890] uppercase tracking-[1.5px] mt-1">
                Weddings
              </p>
            </div>
            <div className="py-5 text-center border-b sm:border-b-0 sm:border-r border-[#F0EBE4]">
              <p className="font-serif text-2xl text-[#2D2D2D]">
                {data?.myWeddings.length ?? 0}
              </p>
              <p className="text-[10px] text-[#A09890] uppercase tracking-[1.5px] mt-1">
                Events
              </p>
            </div>
            <div className="py-5 text-center border-r border-[#F0EBE4]">
              <p className="font-serif text-2xl text-[#4A7C50]">0</p>
              <p className="text-[10px] text-[#A09890] uppercase tracking-[1.5px] mt-1">
                Accepted
              </p>
            </div>
            <div className="py-5 text-center">
              <p className="font-serif text-2xl text-[#9A7C3A]">0</p>
              <p className="text-[10px] text-[#A09890] uppercase tracking-[1.5px] mt-1">
                Pending
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] text-[#A09890] uppercase tracking-[2px]">
              Your weddings
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-[13px] px-5 py-2 bg-[#2D2D2D] text-[#FEFCFA] uppercase tracking-[1.5px] hover:bg-[#B89B7A] transition-colors duration-300"
            >
              {showForm ? "Cancel" : "+ New"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white border border-[#F0EBE4] p-8 mb-6">
              <h2 className="font-serif text-xl text-[#2D2D2D] mb-6">
                New wedding
              </h2>

              {error && (
                <div className="bg-[#FDF0EF] text-[#A04040] px-4 py-3 text-sm mb-6 border border-[#F5D5D5]">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
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
                    placeholder="Petar & Maria's Wedding"
                    className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors"
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
                      value={form.weddingDate}
                      onChange={(e) =>
                        dispatch({
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
                      value={form.venue}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "venue",
                          value: e.target.value,
                        })
                      }
                      placeholder="Rose Garden Estate"
                      className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors"
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
                    value={form.venueAddress}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "venueAddress",
                        value: e.target.value,
                      })
                    }
                    placeholder="123 Garden Lane, Sofia"
                    className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
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
                    className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                    Custom invitation message
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
                    className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] placeholder:text-[#D0C8BE] focus:outline-none focus:border-[#B89B7A] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                    Theme color
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
                      className="w-10 h-10 cursor-pointer border border-[#E0D5C8]"
                    />
                    <span className="text-sm text-[#A09890]">
                      {form.themeColor}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={mutationLoading}
                  className="w-full py-3 bg-[#2D2D2D] text-[#FEFCFA] text-[13px] uppercase tracking-[2px] hover:bg-[#B89B7A] disabled:bg-[#D0C8BE] transition-colors duration-300"
                >
                  {mutationLoading ? "Creating..." : "Create wedding"}
                </button>
              </form>
            </div>
          )}

          {queryLoading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : data?.myWeddings.length === 0 ? (
            <div className="bg-white border border-[#F0EBE4] py-16 text-center">
              <p className="font-serif text-lg text-[#2D2D2D] mb-2">
                No weddings yet
              </p>
              <p className="text-sm text-[#A09890] mb-6">
                Create your first wedding to get started
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-[#B89B7A] hover:text-[#2D2D2D] transition-colors duration-300"
              >
                + Create wedding
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.myWeddings.map((wedding) => {
                const date = new Date(wedding.weddingDate);
                const month = date.toLocaleDateString("en-US", {
                  month: "short",
                });
                const day = date.getDate();

                return (
                  <div
                    key={wedding.id}
                    onClick={() =>
                      router.push(`/dashboard/wedding/${wedding.id}`)
                    }
                    className="bg-white border border-[#F0EBE4] px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF7F2] transition-colors duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <div className="text-center min-w-[44px]">
                        <p className="text-[10px] text-[#B89B7A] uppercase tracking-wider">
                          {month}
                        </p>
                        <p className="font-serif text-2xl text-[#2D2D2D] leading-tight">
                          {day}
                        </p>
                      </div>
                      <div className="w-px h-10 bg-[#F0EBE4]" />
                      <div>
                        <p className="text-sm text-[#2D2D2D] font-medium">
                          {wedding.title}
                        </p>
                        <p className="text-xs text-[#A09890] mt-1">
                          {wedding.venue}
                          {wedding.venueAddress && ` · ${wedding.venueAddress}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {wedding.themeColor && (
                        <div
                          className="w-2 h-2"
                          style={{ backgroundColor: wedding.themeColor }}
                        />
                      )}
                      <button
                        onClick={(e) =>
                          handleDeleteWedding(e, wedding.id, wedding.title)
                        }
                        className="text-xs text-[#D0C8BE] hover:text-[#A04040] transition-colors duration-300"
                      >
                        Remove
                      </button>
                      <span className="text-[#D0C8BE] text-lg">&#8250;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
