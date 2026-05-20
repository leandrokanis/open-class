import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LessonRow } from "./LessonRow";

vi.mock("@/components/ui/Icon", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

const lesson = { id: "L1", title: "Funções e Escopo", durationSeconds: 1320 };

describe("LessonRow", () => {
  it("renders completed state with strikethrough title", () => {
    render(<LessonRow lesson={lesson} isCompleted={true} isActive={false} onClick={vi.fn()} />);
    expect(screen.getByTestId("icon-check_circle")).toBeInTheDocument();
    const title = screen.getByText("Funções e Escopo");
    expect(title).toBeInTheDocument();
  });

  it("renders active (in-progress) state", () => {
    render(<LessonRow lesson={lesson} isCompleted={false} isActive={true} onClick={vi.fn()} />);
    expect(screen.getByTestId("icon-play_circle")).toBeInTheDocument();
  });

  it("renders pending state with empty circle icon", () => {
    render(<LessonRow lesson={lesson} isCompleted={false} isActive={false} onClick={vi.fn()} />);
    expect(screen.getByTestId("icon-radio_button_unchecked")).toBeInTheDocument();
  });

  it("shows formatted duration in minutes", () => {
    render(<LessonRow lesson={lesson} isCompleted={false} isActive={false} onClick={vi.fn()} />);
    expect(screen.getByText("22min")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<LessonRow lesson={lesson} isCompleted={false} isActive={false} onClick={onClick} />);
    await userEvent.click(screen.getByText("Funções e Escopo"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
