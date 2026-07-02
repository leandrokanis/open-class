import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EnrolledCourseCard } from "./EnrolledCourseCard";
import type { EnrollmentWithProgress } from "@/lib/dashboard";

const THUMBNAIL_URL = "http://localhost:41701/uploads/thumbnails/abc.jpg";

function makeEnrollment(
  overrides: Partial<EnrollmentWithProgress["course"]> = {},
): EnrollmentWithProgress {
  return {
    id: "e1",
    status: "active",
    enrolledAt: new Date().toISOString(),
    course: {
      id: "c1",
      title: "Curso Teste",
      slug: "curso-teste",
      level: "beginner",
      thumbnailUrl: THUMBNAIL_URL,
      totalDurationMinutes: 120,
      category: { id: "cat1", name: "Dev Web", slug: "dev-web" },
      instructor: { name: "Prof" },
      ...overrides,
    },
    progress: { completedLessons: 1, totalLessons: 4, percentage: 25 },
    lastLesson: { id: "l1", title: "Aula 1" },
  };
}

describe("EnrolledCourseCard thumbnail", () => {
  it("renders the API thumbnail directly, not through the Next image optimizer", () => {
    const { container } = render(
      <EnrolledCourseCard enrollment={makeEnrollment()} />,
    );
    const img = container.querySelector("img");

    // The /course/[slug] page renders the same API-hosted thumbnail with a plain
    // <img> so the browser fetches it directly. The optimizer path (/_next/image)
    // fetches the asset server-side and breaks for these uploads (#78), so the
    // learning card must not route through it.
    expect(img).not.toBeNull();
    expect(img!.getAttribute("src")).toBe(THUMBNAIL_URL);
    expect(img!.getAttribute("src")).not.toContain("/_next/image");
    expect(img!.getAttribute("srcset") ?? "").not.toContain("/_next/image");
  });

  it("renders no img when the course has no thumbnail", () => {
    const { container } = render(
      <EnrolledCourseCard enrollment={makeEnrollment({ thumbnailUrl: null })} />,
    );
    expect(container.querySelector("img")).toBeNull();
  });
});
