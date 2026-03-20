import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

function TestConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="authenticated">{isAuthenticated.toString()}</p>
      <p data-testid="user">{user ? user.firstName : "none"}</p>
      <button
        onClick={() =>
          login("test-token", {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
          })
        }
      >
        Log In
      </button>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should start unauthenticated with no saved data", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("should authenticate after login", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText("Log In").click();
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("John");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "token",
      "test-token",
    );
  });

  it("should clear auth on logout", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText("Log In").click();
    });

    await act(async () => {
      screen.getByText("Log Out").click();
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
  });

  it("should restore auth from localStorage", async () => {
    localStorageMock.setItem("token", "saved-token");
    localStorageMock.setItem(
      "user",
      JSON.stringify({
        id: "1",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
      }),
    );

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("Jane");
  });
});
