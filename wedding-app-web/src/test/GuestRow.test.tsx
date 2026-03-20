import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GuestRow from "@/components/GuestRow";
import { Guest } from "@/graphql/types";

const mockFetchPreferences = vi.fn();
let mockPrefsLoading = false;
let mockPrefsResult: { guestPreferences: unknown } | undefined = undefined;

vi.mock("@apollo/client/react", () => ({
  useLazyQuery: () => [
    mockFetchPreferences,
    { data: mockPrefsResult, loading: mockPrefsLoading },
  ],
  useMutation: () => [vi.fn(), { loading: false }],
}));

const statusColor = {
  PENDING: "bg-[#FDF5E8] text-[#9A7C3A]",
  ACCEPTED: "bg-[#EDF5EE] text-[#4A7C50]",
  DECLINED: "bg-[#FDF0EF] text-[#A04040]",
};

const mockGuest: Guest = {
  id: "1",
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  rsvpStatus: "PENDING",
  invitationToken: "token-abc-123",
};

const mockSendInvitation = vi.fn();
const mockDeleteGuest = vi.fn();

function renderGuestRow(guest: Guest = mockGuest) {
  return render(
    <table>
      <tbody>
        <GuestRow
          guest={guest}
          statusColor={statusColor}
          onSendInvitation={mockSendInvitation}
          onDeleteGuest={mockDeleteGuest}
        />
      </tbody>
    </table>,
  );
}

describe("GuestRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrefsResult = undefined;
    mockPrefsLoading = false;
  });

  it("should render guest name and email", () => {
    renderGuestRow();

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("should render RSVP status badge", () => {
    renderGuestRow();

    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });

  it("should render accepted status", () => {
    renderGuestRow({ ...mockGuest, rsvpStatus: "ACCEPTED" });

    expect(screen.getByText("ACCEPTED")).toBeInTheDocument();
  });

  it("should call onSendInvitation when clicking Send", async () => {
    renderGuestRow();

    await act(async () => {
      screen.getByText("Send").click();
    });

    expect(mockSendInvitation).toHaveBeenCalledWith("1", "Alice Smith");
  });

  it("should call onDeleteGuest when clicking Remove", async () => {
    renderGuestRow();

    await act(async () => {
      screen.getByText("Remove").click();
    });

    expect(mockDeleteGuest).toHaveBeenCalledWith("1", "Alice Smith");
  });

  it("should expand row and fetch preferences on click", async () => {
    renderGuestRow();

    await act(async () => {
      screen.getByText("Alice Smith").click();
    });

    expect(mockFetchPreferences).toHaveBeenCalledWith({
      variables: { token: "token-abc-123" },
    });
  });

  it("should show no preferences message when none submitted", async () => {
    mockPrefsResult = { guestPreferences: null };

    renderGuestRow();

    await act(async () => {
      screen.getByText("Alice Smith").click();
    });

    expect(
      screen.getByText("No preferences submitted yet."),
    ).toBeInTheDocument();
  });

  it("should show preferences when available", async () => {
    mockPrefsResult = {
      guestPreferences: {
        id: "1",
        foodPreference: "Vegetarian",
        drinkPreference: "Red wine",
        musicPreference: "Jazz",
        dietaryRestrictions: null,
        additionalNotes: null,
      },
    };

    renderGuestRow();

    await act(async () => {
      screen.getByText("Alice Smith").click();
    });

    expect(screen.getByText("Vegetarian")).toBeInTheDocument();
    expect(screen.getByText("Red wine")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
  });

  it("should collapse row on second click", async () => {
    renderGuestRow();

    await act(async () => {
      screen.getByText("Alice Smith").click();
    });

    expect(
      screen.getByText("No preferences submitted yet."),
    ).toBeInTheDocument();

    await act(async () => {
      screen.getByText("Alice Smith").click();
    });

    expect(
      screen.queryByText("No preferences submitted yet."),
    ).not.toBeInTheDocument();
  });
});
