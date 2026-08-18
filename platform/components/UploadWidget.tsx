"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadChart } from "@/app/dashboard/actions";

// Comfortably under next.config.ts's serverActions.bodySizeLimit (10mb) --
// leaves headroom for multipart overhead and gives a clear client-side
// error instead of a generic failure from the server rejecting the request.
const MAX_FILE_BYTES = 9 * 1024 * 1024;

// How long the success state stays on screen before navigating away --
// long enough to register as a deliberate confirmation, not so long it
// feels like a delay.
const SUCCESS_DISPLAY_MS = 700;

type Status = "idle" | "uploading" | "success";

export default function UploadWidget() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (chart screenshot).");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError(
        `That file is ${(file.size / (1024 * 1024)).toFixed(1)}MB -- please upload something under 9MB.`
      );
      return;
    }

    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadChart(formData);
      if (!result.ok) {
        setError(result.error);
        setStatus("idle");
        return;
      }
      setStatus("success");
      // A brief, honest confirmation moment -- not a fake progress
      // percentage, just an acknowledgment the upload landed -- before
      // handing off to the chart page, which is where the real (or mock)
      // analysis result actually lives.
      setTimeout(() => {
        router.push(`/dashboard/charts/${result.chartId}`);
      }, SUCCESS_DISPLAY_MS);
    } catch {
      // Only genuinely unexpected failures land here (network error
      // calling the action, etc) -- uploadChart returns { ok: false }
      // for every failure it can anticipate, so the message survives
      // Next.js's production redaction of thrown Server Action errors.
      setError("Upload failed. Please try again.");
      setStatus("idle");
    }
  }

  const isInteractive = status === "idle";

  return (
    <div id="upload">
      <div
        className={`upload-zone${isDragging ? " is-dragging" : ""}${status !== "idle" ? ` upload-zone--${status}` : ""}`}
        onClick={() => isInteractive && inputRef.current?.click()}
        onDragOver={(e) => {
          if (!isInteractive) return;
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!isInteractive) return;
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onKeyDown={(e) => {
          // A div with role="button" doesn't get free keyboard activation
          // the way a real <button> does -- Enter/Space must be wired up
          // by hand per WAI-ARIA authoring practices.
          if (!isInteractive) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        aria-disabled={!isInteractive}
        tabIndex={isInteractive ? 0 : -1}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        {status === "success" ? (
          <>
            <svg
              className="upload-zone__icon upload-zone__icon--success"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12.5l2.5 2.5L16 9.5" />
            </svg>
            <div className="upload-zone__label">Chart uploaded</div>
            <div className="upload-zone__hint">Opening analysis…</div>
          </>
        ) : (
          <>
            <svg
              className="upload-zone__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 18a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.5 8H17a3.5 3.5 0 0 1 0 7h-1" />
              <path d="M12 12v7" />
              <path d="M9 15l3-3 3 3" />
            </svg>
            <div className="upload-zone__label">
              {status === "uploading"
                ? "Uploading…"
                : "Drop a chart screenshot, or click to browse"}
            </div>
            <div className="upload-zone__hint">
              PNG, JPG — up to 9MB, one chart at a time
            </div>
            {status === "uploading" ? (
              <div
                className="upload-progress"
                role="progressbar"
                aria-label="Uploading chart"
              >
                <div className="upload-progress__bar" />
              </div>
            ) : null}
          </>
        )}
      </div>
      {error ? <div className="form-error">{error}</div> : null}
    </div>
  );
}
