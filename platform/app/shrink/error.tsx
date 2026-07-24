"use client";

import { useEffect } from "react";
import AppNav from "@/components/AppNav";

export default function ShrinkError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <AppNav active="shrink" />
      <main className="dash-main">
        <div className="container">
          <div className="empty-state" style={{ borderColor: "rgba(255,77,77,.4)" }}>
            <div className="badge badge--mock" style={{ marginBottom: "16px" }}>
              SOMETHING WENT WRONG
            </div>
            <p>This page hit an unexpected error.</p>
            <button className="btn btn--primary" onClick={() => unstable_retry()}>
              Try again
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
