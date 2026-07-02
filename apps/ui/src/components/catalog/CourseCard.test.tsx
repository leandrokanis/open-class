import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseCard } from "./CourseCard";
import type { CourseListItem } from "@/lib/catalog";

const baseCourse: CourseListItem = {
  id: "c1",
  title: "Fundamentos de React",
  slug: "fundamentos-de-react",
  shortDescription: null,
  level: "beginner",
  thumbnailUrl: null,
  rating: 4.7,
  reviewCount: 1200,
  lessonCount: 24,
  totalDurationMinutes: 130,
  category: { id: "cat1", name: "Dev Web", slug: "dev-web" },
  instructor: { name: "Ada Lovelace" },
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("CourseCard", () => {
  it("renders the thumbnail image when thumbnailUrl is present", () => {
    render(
      <CourseCard
        course={{ ...baseCourse, thumbnailUrl: "https://cdn.example.com/react.jpg" }}
      />,
    );

    const img = screen.getByRole("img", { name: baseCourse.title });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("react.jpg");
  });

  it("does not render an image when thumbnailUrl is null", () => {
    render(<CourseCard course={{ ...baseCourse, thumbnailUrl: null }} />);

    expect(screen.queryByRole("img", { name: baseCourse.title })).toBeNull();
  });
});
