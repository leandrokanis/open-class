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

const THUMBNAIL_URL = "https://api.picgama.online/uploads/thumbnails/abc.jpg";

describe("CourseCard", () => {
  it("renders the API thumbnail directly, not through the Next image optimizer", () => {
    const { container } = render(
      <CourseCard course={{ ...baseCourse, thumbnailUrl: THUMBNAIL_URL }} />,
    );
    const img = container.querySelector("img");

    // The upload host (api.picgama.online) is not in next.config images.remotePatterns,
    // so the optimizer (/_next/image) returns 400 in production and the image breaks (#83).
    // The card must fetch the asset directly, exactly like EnrolledCourseCard on /learning.
    expect(img).not.toBeNull();
    expect(img!.getAttribute("src")).toBe(THUMBNAIL_URL);
    expect(img!.getAttribute("src")).not.toContain("/_next/image");
    expect(img!.getAttribute("srcset") ?? "").not.toContain("/_next/image");
  });

  it("does not overlay a play icon on the thumbnail", () => {
    const { container } = render(
      <CourseCard course={{ ...baseCourse, thumbnailUrl: THUMBNAIL_URL }} />,
    );

    // The play triangle path must not be rendered over the thumbnail (#83).
    expect(container.querySelector('path[d="M1 1l14 8-14 8V1z"]')).toBeNull();
  });

  it("does not render an image when thumbnailUrl is null", () => {
    render(<CourseCard course={{ ...baseCourse, thumbnailUrl: null }} />);

    expect(screen.queryByRole("img", { name: baseCourse.title })).toBeNull();
  });
});
