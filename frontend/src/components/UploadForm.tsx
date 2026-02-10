import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Lightbulb, CheckCircle2 } from "lucide-react";
import { uploadAndProcessLecture } from "../api/client";

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
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
      setDelayCountdown(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <style>{`
        .text-brand-coral { color: #c84449; }
      `}</style>
      <div className="bg-red-50 rounded-xl border border-slate-200 p-10 lg:p-12 shadow-md  hover:shadow-md transition ">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#362c5d" }}>
            Upload Your Lecture
          </h2>
          <p className="text-slate-600">
            Upload a video and optional slides to generate comprehensive study
            materials
          </p>
        </div>

        <div className="space-y-8">
          {/* Lecture Title Input */}
          <div>
            <label
              htmlFor="lecture-title"
              className="block text-sm font-semibold mb-3"
              style={{ color: "#362c5d" }}
            >
              Lecture Title <span style={{ color: "#c84449" }}>*</span>
            </label>
            <input
              id="lecture-title"
              type="text"
              placeholder="e.g., Introduction to Data Structures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-slate-700 focus:ring-2 focus:outline-none transition-all"
              required
            />
          </div>

          {/* Video File Upload */}
          <div>
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: "#362c5d" }}
            >
              Video File <span style={{ color: "#c84449" }}>*</span>
              <span className="text-slate-500 font-normal ml-2">
                (MP4, MOV, AVI, WebM)
              </span>
            </label>
            <div
              className="relative border-2 border-dashed rounded-lg transition-all cursor-pointer"
              style={{
                borderColor: video ? "#c84449" : "#cbd5e1",
                backgroundColor: video ? "#f5f0f0" : "rgb(241, 245, 249)",
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
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "rgba(200, 68, 73, 0.1)" }}
                    >
                      <CheckCircle2
                        className="w-8 h-8"
                        style={{ color: "#c84449" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "rgba(54, 44, 93, 0.1)" }}
                    >
                      <Upload
                        className="w-8 h-8"
                        style={{ color: "#362c5d" }}
                      />
                    </div>
                  )}
                </div>
                <p className="font-semibold mb-1" style={{ color: "#362c5d" }}>
                  {video ? "Video selected" : "Click or drag video to upload"}
                </p>
                <p className="text-slate-600 text-sm">
                  {video
                    ? `${video.name} • ${formatFileSize(video.size)}`
                    : "Maximum size: 500MB"}
                </p>
              </label>
            </div>
          </div>

          {/* Slides Upload (Optional) */}
          <div>
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: "#362c5d" }}
            >
              Slides{" "}
              <span className="text-slate-500 font-normal">
                (PDF, Optional)
              </span>
            </label>
            <div
              className="relative border-2 border-dashed rounded-lg transition-all cursor-pointer"
              style={{
                borderColor: slides ? "#c84449" : "#cbd5e1",
                backgroundColor: slides ? "#f5f0f0" : "rgb(241, 245, 249)",
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
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "rgba(200, 68, 73, 0.1)" }}
                    >
                      <CheckCircle2
                        className="w-8 h-8"
                        style={{ color: "#c84449" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "rgba(54, 44, 93, 0.1)" }}
                    >
                      <FileText
                        className="w-8 h-8"
                        style={{ color: "#362c5d" }}
                      />
                    </div>
                  )}
                </div>
                <p className="font-semibold mb-1\" style={{ color: "#362c5d" }}>
                  {slides
                    ? "Slides selected"
                    : "Click or drag slides to upload"}
                </p>
                <p className="text-slate-600 text-sm\">
                  {slides
                    ? `${slides.name} • ${formatFileSize(slides.size)}`
                    : "Optional - helps with context"}
                </p>
              </label>
            </div>
          </div>

          {/* Info Tip */}
          <div
            className="flex gap-4 p-4 rounded-lg"
            style={{
              backgroundColor: "rgba(54, 44, 93, 0.05)",
              borderLeft: "4px solid #362c5d",
            }}
          >
            <Lightbulb
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: "#362c5d" }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: "#362c5d" }}>
                Processing Time
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Most lectures process in 2–5 minutes. You'll get instant access
                to notes, flashcards, and quizzes.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!video || !title || isLoading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all transform ${
              !video || !title || isLoading
                ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                : "text-white hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
            }`}
            style={{
              backgroundColor:
                !video || !title || isLoading ? "#cbd5e1" : "#362c5d",
              color: !video || !title || isLoading ? "#64748b" : "#ffffff",
            }}
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
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Process Lecture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
