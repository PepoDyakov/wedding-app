import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "@/components/ProtectedRoute";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUseAuth = vi.fn();

vi.mock("@/lib/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Secret Content")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should render nothing while loading", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: true });

    const { container } = render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>,
    );

    expect(container.innerHTML).toBe("");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should redirect when not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    const { container } = render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>,
    );

    expect(container.innerHTML).toBe("");
    expect(mockPush).toHaveBeenCalledWith("/auth");
  });
});
