import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DiffLine } from "@storyapp/types";
import DiffView from "./DiffView";
import { renderWithStore } from "../../test/renderWithStore";

const diff: DiffLine[] = [
  { type: "unchanged", oldLine: 1, newLine: 1, text: "Once upon a time" },
  { type: "removed", oldLine: 2, newLine: null, text: "there was a cat" },
  { type: "added", oldLine: null, newLine: 2, text: "there was a dragon" },
];

describe("DiffView", () => {
  it("renders every line of the diff", () => {
    renderWithStore(<DiffView diff={diff} />);
    expect(screen.getByText("Once upon a time")).toBeInTheDocument();
    expect(screen.getByText("there was a cat")).toBeInTheDocument();
    expect(screen.getByText("there was a dragon")).toBeInTheDocument();
  });

  it("shows +/- markers, so the diff is readable without relying on colour alone", () => {
    renderWithStore(<DiffView diff={diff} />);
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders the added/removed counts when stats are supplied", () => {
    renderWithStore(<DiffView diff={diff} stats={{ added: 1, removed: 1 }} />);
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("copes with an empty diff", () => {
    const { container } = renderWithStore(<DiffView diff={[]} />);
    expect(container.querySelectorAll("tr")).toHaveLength(0);
  });
});
