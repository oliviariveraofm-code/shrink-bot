"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CHART_BUCKET } from "@/lib/storage";
import { createChartRecord } from "@/app/dashboard/actions";

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
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Your session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(CHART_BUCKET)
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      try {
        const chartId = await createChartRecord(path);
        router.push(`/dashboard/charts/${chartId}`);
      } catch (err) {
        // The file uploaded but the DB record failed -- clean up rather
        // than leaving an orphaned file with nothing pointing to it.
        await supabase.storage.from(CHART_BUCKET).remove([path]);
        throw err;
      }
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
