import React from "react";

export default function LessonPlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="dark" style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      {children}
    </div>
  );
}
