import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("test setup", () => {
  it("should render a basic element", () => {
    render(<div>Hello Test</div>);
    expect(screen.getByText("Hello Test")).toBeInTheDocument();
  });
});
