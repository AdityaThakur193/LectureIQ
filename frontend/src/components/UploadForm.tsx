import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Lightbulb, CheckCircle2 } from "lucide-react";
import { uploadAndProcessLecture } from "../api/client";
import { validateUploadForm } from "../utils/validation";

export default function UploadForm() {
  const navigate = useNavigate();
  const [video, setVideo] = useState<File | null>(null);
  const [slides, setSlides] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delayCountdown, setDelayCountdown] = useState(0);
  const PROCESS_DELAY = 2; // Delay in seconds (change this value to adjust the delay)

  // Handle countdown timer
  useEffect(() => {
    if (delayCountdown > 0) {
      const timer = setTimeout(
        () => setDelayCountdown(delayCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [delayCountdown]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    const validationErrors = validateUploadForm(title, video, slides || undefined);
    if (validationErrors.length > 0) {
      setError(validationErrors[0].message);
      return;
    }

    if (!video || !title) return;

    setIsLoading(true);
    setError(null);
    setDelayCountdown(PROCESS_DELAY);

    // Wait for the delay
    await new Promise((resolve) => setTimeout(resolve, PROCESS_DELAY * 1000));

    try {
      // Upload and process lecture (saves to IndexedDB automatically)
      const lecture = await uploadAndProcessLecture(
        title,
        video,
        slides || undefined,
      );

      // Navigate to the lecture page
      navigate(`/lectures/${lecture.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setError(errorMessage);

    } finally {
      setIsLoading(false);
      setDelayCountdown(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-10 lg:p-12 shadow-sm">
        <div className="space-y-8">
          {/* Lecture Title Input */}
          <div>
            <label
              htmlFor="lecture-title"
              className="block text-sm font-semibold mb-3 text-brand-navy"
            >
              Lecture title <span className="text-brand-emerald">*</span>
            </label>
            <input
              id="lecture-title"
              type="text"
              placeholder="e.g., Introduction to Data Structures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20 focus:outline-none transition-all"
              required
            />
          </div>

          {/* Video File Upload */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-brand-navy">
              Video <span className="text-brand-emerald">*</span>
              <span className="text-slate-500 font-normal ml-2">
                (MP4, MOV, AVI, WebM up to 500MB)
              </span>
            </label>
            <div
              className="relative border-2 border-dashed rounded transition-all cursor-pointer"
              style={{
                borderColor: video ? "#059669" : "#cbd5e1",
                backgroundColor: video ? "#d1fae5" : "#f3f4f6",
              }}
            >
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="block p-12 text-center cursor-pointer"
              >
                <div className="flex justify-center mb-4">
                  {video ? (
                    <div className="p-3 rounded bg-brand-emerald/10">
                      <CheckCircle2 className="w-8 h-8 text-brand-emerald" />
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-brand-navy/10">
                      <Upload className="w-8 h-8 text-brand-navy" />
                    </div>
                  )}
                </div>
                <p className="font-semibold mb-1 text-brand-navy">
                  {video ? "Ready to process" : "Add your lecture video"}
                </p>
                <p className="text-slate-600 text-sm">
                  {video
                    ? `${video.name} (${formatFileSize(video.size)})`
                    : "Drag to upload or click to browse"}
                </p>
              </label>
            </div>
          </div>

          {/* Slides Upload (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-brand-navy">
              Slides <span className="text-slate-500 font-normal">(PDF, optional)</span>
            </label>
            <div
              className="relative border-2 border-dashed rounded transition-all cursor-pointer"
              style={{
                borderColor: slides ? "#059669" : "#cbd5e1",
                backgroundColor: slides ? "#d1fae5" : "#f3f4f6",
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSlides(e.target.files?.[0] ?? null)}
                className="hidden"
                id="slides-upload"
              />
              <label
                htmlFor="slides-upload"
                className="block p-10 text-center cursor-pointer"
              >
                <div className="flex justify-center mb-4">
                  {slides ? (
                    <div className="p-3 rounded bg-brand-emerald/10">
                      <CheckCircle2 className="w-8 h-8 text-brand-emerald" />
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-brand-navy/10">
                      <FileText className="w-8 h-8 text-brand-navy" />
                    </div>
                  )}
                </div>
                <p className="font-semibold mb-1 text-brand-navy">
                  {slides ? "Slides selected" : "Add presentation slides"}
                </p>
                <p className="text-slate-600 text-sm">
                  {slides
                    ? `${slides.name} (${formatFileSize(slides.size)})`
                    : "Helps provide visual context"}
                </p>
              </label>
            </div>
          </div>

          {/* Info message */}
          <div className="flex gap-4 p-4 rounded bg-brand-emerald/5 border border-brand-emerald/20">
            <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-emerald" />
            <div>
              <p className="text-sm font-medium text-brand-navy">
                Takes 2–5 minutes
              </p>
              <p className="text-sm text-slate-600 mt-1">
                You'll immediately get organized notes, flashcards, and practice quizzes.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded bg-red-50 border border-red-200">
              <p className="text-sm text-red-800 font-medium">Error: {error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!video || !title || isLoading}
            className="w-full py-4 px-6 rounded font-semibold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed bg-white border-2 border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-white"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Processing your lecture...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload & Process</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
