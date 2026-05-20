import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { YouTubeEmbed } from "./YouTubeEmbed";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useId: () => "test-id" };
});

const mockPlayer = { destroy: vi.fn() };
const mockYTPlayer = vi.fn(() => mockPlayer);

beforeEach(() => {
  vi.clearAllMocks();
  window.YT = { Player: mockYTPlayer, PlayerState: { ENDED: 0 } } as unknown as typeof YT;
});

describe("YouTubeEmbed", () => {
  it("creates a YT.Player targeting the container div when videoId is provided", () => {
    render(<YouTubeEmbed videoId="dQw4w9WgXcQ" />);
    expect(mockYTPlayer).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ videoId: "dQw4w9WgXcQ" }),
    );
  });

  it("renders fallback message and does not create player when videoId is null", () => {
    render(<YouTubeEmbed videoId={null} />);
    expect(screen.getByText("Vídeo não disponível")).toBeInTheDocument();
    expect(mockYTPlayer).not.toHaveBeenCalled();
  });

  it("calls onEnded when video state changes to ENDED (0)", () => {
    const onEnded = vi.fn();
    render(<YouTubeEmbed videoId="dQw4w9WgXcQ" onEnded={onEnded} />);

    const [, options] = mockYTPlayer.mock.calls[0] as [string, YT.PlayerOptions];
    options.events?.onStateChange?.({ data: 0, target: mockPlayer as unknown as YT.Player });

    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("does not call onEnded for non-ENDED state changes", () => {
    const onEnded = vi.fn();
    render(<YouTubeEmbed videoId="dQw4w9WgXcQ" onEnded={onEnded} />);

    const [, options] = mockYTPlayer.mock.calls[0] as [string, YT.PlayerOptions];
    options.events?.onStateChange?.({ data: 1, target: mockPlayer as unknown as YT.Player });

    expect(onEnded).not.toHaveBeenCalled();
  });
});
