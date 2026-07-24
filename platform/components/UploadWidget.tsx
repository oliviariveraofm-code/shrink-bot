"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadChart } from "@/app/dashboard/actions";

export default function UploadWidget() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (chart screenshot).");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const chartId = await uploadChart(formData);
      router.push(`/dashboard/charts/${chartId}`);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div id="upload">
      <div
        className={`upload-zone${isDragging ? " is-dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        role="button"
        tabIndex={0}
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
        <div className="upload-zone__label">
          {isUploading ? "Uploading…" : "Drop a chart screenshot, or click to browse"}
        </div>
        <div className="upload-zone__hint">PNG, JPG — one chart at a time</div>
      </div>
      {error ? <div className="form-error">{error}</div> : null}
    </div>
  );
}
