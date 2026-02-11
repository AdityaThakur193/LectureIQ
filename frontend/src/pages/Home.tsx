import { useLocation } from "react-router-dom";
import {
  Zap,
  Brain,
  CheckCircle2,
  Play,
  X,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import UploadForm from "../components/UploadForm";
import StudyPackShowcase from "../components/StudyPackShowcase";

export default function Home() {
  const location = useLocation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isShowingDemo, setIsShowingDemo] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const scrollToUpload = () => {
    document
      .getElementById("upload-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo === "upload") {
      setTimeout(() => {
        scrollToUpload();
      }, 50);
    }
  }, [location.state]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isShowingDemo) {
        setIsShowingDemo(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isShowingDemo]);

  // Reset video loading state when modal opens
  useEffect(() => {
    if (isShowingDemo) {
      setIsVideoLoading(true);
    }
  }, [isShowingDemo]);

  return (
    <div className="bg-slate-50 overflow-hidden">
      <style>{`
        .text-brand-navy { color: #1a1f3a; }
        .bg-brand-coral-light { background-color: #f5f0f0; }
        .bg-brand-navy-light { background-color: #f8f6fa; }
        .border-brand-coral { border-color: #c84449; }
        .border-brand-navy { border-color: #1a1f3a; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(60px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0;
            transform: translateY(40px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ============ HERO SECTION - ASYMMETRIC LAYOUT ============ */}
      <section className="relative pt-32 pb-32 overflow-hidden bg-white">
        {/* Decorative background element - not centered */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-3xl bg-brand-emerald/5 blur-3xl" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12 items-start">
            {/* Left: Headline - Left-aligned, not centered */}
            <div className="lg:col-span-2 max-w-2xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="w-12 h-1 bg-brand-navy rounded-full" />
                <span className="text-xs font-semibold tracking-widest uppercase text-brand-navy opacity-70">
                  Learning Reimagined
                </span>
              </div>

              <h1 className="font-serif text-6xl lg:text-7xl font-bold mb-8 leading-tight text-brand-navy">
                Stop transcribing.
                <br />
                Start learning.
              </h1>

              <p className="text-lg text-slate-700 mb-12 leading-relaxed max-w-lg font-light">
                Upload your lectures. In minutes, get perfectly organized notes, focused study materials, and comprehensive practice quizzes—all extracted and structured automatically.
              </p>

              {/* Button group - left aligned */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <button
                  onClick={scrollToUpload}
                  className="px-7 py-4 text-white font-semibold rounded transition-all duration-200 hover:shadow-lg active:scale-95 bg-brand-navy"
                >
                  Upload a Lecture
                </button>
                <button
                  onClick={() => setIsShowingDemo(true)}
                  className="px-7 py-4 border-2 border-brand-navy text-brand-navy font-semibold rounded transition-all duration-200 hover:bg-brand-navy hover:text-white active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    See it in action
                  </span>
                </button>
              </div>

              {/* Stats - not chip styled, more raw */}
              <div className="flex flex-wrap gap-8 text-sm">
                <div>
                  <div className="font-serif text-3xl font-bold text-brand-navy">2-5min</div>
                  <div className="text-slate-600 text-xs mt-1">processing time</div>
                </div>
                <div>
                  <div className="font-serif text-3xl font-bold text-brand-navy">100%</div>
                  <div className="text-slate-600 text-xs mt-1">private & yours</div>
                </div>
                <div>
                  <div className="font-serif text-3xl font-bold text-brand-navy">No code</div>
                  <div className="text-slate-600 text-xs mt-1">required</div>
                </div>
              </div>

              {isShowingDemo && (
                <div
                  className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/70 backdrop-blur-md p-4 pt-24"
                  onClick={() => setIsShowingDemo(false)}
                  style={{
                    animation: "fadeIn 0.2s ease-out",
                  }}
                >
                  <div
                    className="w-full max-w-5xl rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200"
                    style={{
                      animation: "slideInUp 0.3s ease-out",
                      boxShadow: "0 25px 50px -12px rgba(26, 31, 58, 0.2)",
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div
                      className="flex items-center justify-between px-6 py-4 border-b border-slate-200"
                      style={{
                        backgroundColor: "#f9fafb",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded flex items-center justify-center bg-brand-emerald/10"
                        >
                          <Play
                            className="w-5 h-5"
                            style={{ color: "#059669" }}
                          />
                        </div>
                        <div>
                          <p
                            className="font-semibold text-base text-brand-navy"
                          >
                            LectureIQ in Action
                          </p>
                          <p className="text-xs text-slate-500">
                            See how it works
                          </p>
                        </div>
                      </div>
                      <button
                        className="w-8 h-8 rounded flex items-center justify-center border border-slate-200 transition-all hover:bg-slate-100 hover:rotate-90 text-brand-navy"
                        onClick={() => setIsShowingDemo(false)}
                        aria-label="Close demo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div
                      className="relative w-full bg-slate-50"
                      style={{ paddingTop: "56.25%" }}
                    >
                      {isVideoLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Loader2
                              className="w-12 h-12 animate-spin mx-auto mb-3"
                              style={{ color: "#059669" }}
                            />
                            <p
                              className="text-sm font-medium text-brand-navy"
                            >
                              Loading demo...
                            </p>
                          </div>
                        </div>
                      )}
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src="https://drive.google.com/file/d/1bq02GVgX8F91tVBVQhGAMROPB8J7jiAU/preview"
                        title="LectureIQ Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setIsVideoLoading(false)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Stacked card preview */}
            <div className="hidden lg:block relative w-full min-h-[32rem]">
              {/* Notes Card - Base layer */}
              <div
                className="absolute bg-white rounded-lg p-6 shadow-lg border border-slate-200 transition-all duration-300 cursor-pointer overflow-hidden"
                style={{
                  width: "420px",
                  top: "0px",
                  right: "200px",
                  transform:
                    hoveredCard === "notes"
                      ? "translateY(-12px) rotate(-1deg)"
                      : "rotate(-2deg)",
                  zIndex: 30,
                }}
                onMouseEnter={() => setHoveredCard("notes")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded bg-brand-navy/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-brand-navy" />
                  </div>
                  <h3 className="font-semibold text-brand-navy text-sm">
                    Comprehensive Notes
                  </h3>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-2 bg-brand-navy/10 rounded w-4/5" />
                  <div className="h-2 bg-brand-navy/10 rounded w-3/5" />
                  <div className="h-2 bg-brand-navy/10 rounded w-2/3" />
                </div>
                <p className="text-xs text-slate-500">Auto-arranged with timestamps</p>
              </div>

              {/* Flashcards Card - Middle layer */}
              <div
                className="absolute bg-brand-emerald/5 rounded-lg p-6 shadow-lg border border-brand-emerald/30 transition-all duration-300 cursor-pointer overflow-hidden"
                style={{
                  width: "420px",
                  top: "160px",
                  right: "170px",
                  transform:
                    hoveredCard === "flashcards"
                      ? "translateY(-12px) rotate(0deg)"
                      : "rotate(1deg)",
                  zIndex: 20,
                }}
                onMouseEnter={() => setHoveredCard("flashcards")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded bg-brand-emerald/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-brand-emerald" />
                  </div>
                  <h3 className="font-semibold text-brand-navy text-sm">
                    Smart Flashcards
                  </h3>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-2 bg-brand-emerald/20 rounded w-full" />
                  <div className="h-2 bg-brand-emerald/20 rounded w-3/4" />
                </div>
                <p className="text-xs text-slate-600">Spaced repetition built in</p>
              </div>

              {/* Quiz Card - Front layer */}
              <div
                className="absolute bg-white rounded-lg p-6 shadow-lg border border-slate-200 transition-all duration-300 cursor-pointer overflow-hidden"
                style={{
                  width: "420px",
                  top: "320px",
                  right: "140px",
                  transform:
                    hoveredCard === "quiz"
                      ? "translateY(-12px) rotate(1deg)"
                      : "rotate(-1deg)",
                  zIndex: 10,
                }}
                onMouseEnter={() => setHoveredCard("quiz")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded bg-brand-navy/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-brand-navy" />
                  </div>
                  <h3 className="font-semibold text-brand-navy text-sm">
                    Practice Quizzes
                  </h3>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-2 bg-brand-navy/10 rounded w-full" />
                  <div className="h-2 bg-brand-navy/10 rounded w-1/2" />
                </div>
                <p className="text-xs text-slate-500">Instant feedback & explanations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ UPLOAD FORM SECTION ============ */}
      <section
        id="upload-form"
        className="py-32 bg-brand-navy text-white relative overflow-hidden"
      >
        {/* Subtle decorative accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-emerald/5 rounded-full blur-3xl -translate-y-1/2" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="mb-12">
              <h2 className="font-serif text-4xl font-bold mb-4">
                Ready to reclaim your study time?
              </h2>
              <p className="text-brand-emerald-light text-lg font-light">
                Upload your lecture right now. It'll be ready in 2-5 minutes.
              </p>
            </div>
            <UploadForm />
          </div>
        </div>
      </section>

      {/* ============ STUDY PACK PREVIEW ============ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4 text-brand-navy">
              Your Generated Study Pack
            </h2>
            <p className="text-slate-700 font-light">
              Everything you need to master the material in one beautiful dashboard
            </p>
          </div>

          <StudyPackShowcase />
        </div>
      </section>
    </div>
  );
}
