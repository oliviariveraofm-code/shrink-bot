"use client";

import { useEffect } from "react";
import AppNav from "@/components/AppNav";

// Error boundaries must be Client Components. Covers /dashboard and
// /dashboard/charts/[id] both -- one error.tsx applies to its whole
// route segment unless a more specific one exists deeper.
//
// Next.js 16 renamed the retry callback from `reset` to `unstable_retry`
// -- confirmed against node_modules/next/dist/docs/ rather than assumed.
export default function DashboardError({
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
      <AppNav active="dashboard" />
      <main className="dash-main">
        <div className="container">
          <div className="empty-state" style={{ borderColor: "rgba(255,77,77,.4)" }}>
            <div className="badge badge--mock" style={{ marginBottom: "16px" }}>
              SOMETHING WENT WRONG
            </div>
            <p>
              This page hit an unexpected error. If you&rsquo;re still setting
              things up, double-check the Supabase env vars and that both
              migrations have been run.
            </p>
            <button className="btn btn--primary" onClick={() => unstable_retry()}>
              Try again
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
