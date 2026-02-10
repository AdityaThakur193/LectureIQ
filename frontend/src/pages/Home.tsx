import { useNavigate } from "react-router-dom";
import {
  Upload,
  Zap,
  Brain,
  Layers,
  CheckCircle2,
  ArrowRight,
  Play,
} from "lucide-react";
import { useState } from "react";
import UploadForm from "../components/UploadForm";
import StudyPackShowcase from "../components/StudyPackShowcase";

const StatChip = ({ label, value }: { label: string; value: string }) => (
  <div
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-white"
    style={{ borderColor: "rgba(200, 68, 73, 0.3)" }}
  >
    <span className="text-xs font-medium" style={{ color: "#362c5d" }}>
      {value}
    </span>
    <span className="text-xs text-slate-600">{label}</span>
  </div>
);

const CircleMotif = ({ className = "" }: { className?: string }) => (
  <div
    className={`absolute rounded-full opacity-5 pointer-events-none ${className}`}
    style={{ backgroundColor: "#c84449" }}
  />
);

export default function Home() {
  const navigate = useNavigate();
  const [stats] = useState({ lectures: 0, flashcards: 0, quizzes: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const scrollToUpload = () => {
    document
      .getElementById("upload-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white overflow-hidden">
      <style>{`
        .text-brand-navy { color: #362c5d; }
        .text-brand-coral { color: #c84449; }
        .bg-brand-navy { background-color: #362c5d; }
        .bg-brand-coral { background-color: #c84449; }
        .bg-brand-coral-light { background-color: #f5f0f0; }
        .bg-brand-navy-light { background-color: #f8f6fa; }
        .border-brand-coral { border-color: #c84449; }
        .border-brand-navy { border-color: #362c5d; }
        .hover\:border-brand-coral\/30:hover { border-color: rgba(200, 68, 73, 0.3); }
        .hover\:bg-brand-navy-light:hover { background-color: #f8f6fa; }
      `}</style>
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20">
        {/* Background motifs */}
        <CircleMotif className="top-20 left-10 w-96 h-96" />
        <CircleMotif className="bottom-32 right-20 w-80 h-80" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Headline & CTA */}
            <div className="max-w-xl">
              <div className="mb-8">
                <span className="inline-block text-xs font-medium tracking-widest uppercase text-brand-coral mb-6">
                  Transform Learning
                </span>
              </div>

              <h1
                className="text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight"
                style={{ color: "#362c5d" }}
              >
                AI-Powered Learning,{" "}
                <span className="relative">
                  Reimagined
                  <div
                    className="absolute -bottom-2 left-0 w-full h-1"
                    style={{ backgroundColor: "rgba(200, 68, 73, 0.2)" }}
                  />
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-12 leading-relaxed max-w-md">
                Automatically convert lecture videos into comprehensive{" "}
                <i>
                  <b>
                    study materials: organized notes, targeted flashcards, and
                    intelligent quizzes. Minutes, not hours.
                  </b>
                </i>
              </p>

              {/* Stat Chips */}
              <div className="flex flex-wrap gap-3 mb-12">
                <StatChip value="342" label="flashcards generated" />
                <StatChip value="25" label="quiz questions" />
                <StatChip value="2-5 min" label="processing time" />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToUpload}
                  className="px-8 py-4 text-white font-semibold rounded-lg hover:opacity-90 transition transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: "#362c5d" }}
                >
                  Upload Lecture
                </button>
                <button
                  onClick={() => setShowDemo(true)}
                  className="px-8 py-4 border-2 font-semibold rounded-lg transition"
                  style={{
                    borderColor: "#362c5d",
                    color: "#362c5d",
                    backgroundColor: "rgba(54, 44, 93, 0.02)",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </span>
                </button>
              </div>

              {showDemo && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                  onClick={() => setShowDemo(false)}
                >
                  <div
                    className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden border"
                    style={{ borderColor: "rgba(54, 44, 93, 0.15)" }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div
                      className="flex items-center justify-between px-5 py-4 border-b"
                      style={{
                        backgroundColor: "rgba(54, 44, 93, 0.03)",
                        borderColor: "rgba(54, 44, 93, 0.15)",
                      }}
                    >
                      <p className="font-semibold" style={{ color: "#362c5d" }}>
                        Product Demo
                      </p>
                      <button
                        className="text-sm px-3 py-1 rounded-full border transition"
                        style={{
                          borderColor: "#362c5d",
                          color: "#362c5d",
                          backgroundColor: "rgba(54, 44, 93, 0.06)",
                        }}
                        onClick={() => setShowDemo(false)}
                      >
                        Close
                      </button>
                    </div>
                    <div
                      className="relative w-full"
                      style={{ paddingTop: "56.25%" }}
                    >
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                        title="LectureIQ Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Dashboard Preview */}
            <div className="hidden lg:block relative h-96">
              {/* Stacked cards mockup */}
              <div className="absolute top-0 left-0 w-full">
                {/* AI Notes Card */}
                <div
                  className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mb-4 cursor-pointer transition-all duration-300 overflow-hidden"
                  style={{
                    transform:
                      hoveredCard === "notes"
                        ? "translateX(20px) scale(1.05) -rotate-1"
                        : "translateX(0) scale(1) -rotate-2",
                    boxShadow:
                      hoveredCard === "notes"
                        ? "0 20px 25px -5px rgba(54, 44, 93, 0.3)"
                        : "rgba(0, 0, 0, 0.1) 0 10px 15px -3px",
                  }}
                  onMouseEnter={() => setHoveredCard("notes")}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg bg-brand-navy/10 flex items-center justify-center transition-transform"
                      style={{
                        transform:
                          hoveredCard === "notes"
                            ? "scale(1.2) rotate(10deg)"
                            : "scale(1)",
                      }}
                    >
                      <Layers className="w-5 h-5 text-brand-navy" />
                    </div>
                    <h3 className="font-semibold text-brand-navy text-sm">
                      AI Notes
                    </h3>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-2 bg-brand-navy/10 rounded w-3/4" />
                    <div className="h-2 bg-brand-navy/10 rounded w-1/2" />
                  </div>
                  <div
                    className="text-xs text-slate-600 transition-all duration-300 overflow-hidden"
                    style={{
                      opacity: hoveredCard === "notes" ? 1 : 0,
                      maxHeight: hoveredCard === "notes" ? "100px" : "0px",
                      transform:
                        hoveredCard === "notes"
                          ? "translateY(0)"
                          : "translateY(-10px)",
                    }}
                  >
                    <p className="font-semibold text-brand-navy mb-1">
                      Auto-organized & timestamped
                    </p>
                    <p>
                      Key concepts, formulas, and worked examples extracted in
                      seconds
                    </p>
                  </div>
                </div>

                {/* Flashcards Card */}
                <div
                  className="bg-brand-coral-light rounded-xl p-6 shadow-lg border border-brand-coral/20 mb-4 cursor-pointer transition-all duration-300 overflow-hidden"
                  style={{
                    transform:
                      hoveredCard === "flashcards"
                        ? "translateX(20px) scale(1.08) rotate(0deg)"
                        : "translateX(0) scale(1) rotate(1deg)",
                    boxShadow:
                      hoveredCard === "flashcards"
                        ? "0 20px 25px -5px rgba(200, 68, 73, 0.3)"
                        : "rgba(0, 0, 0, 0.1) 0 10px 15px -3px",
                  }}
                  onMouseEnter={() => setHoveredCard("flashcards")}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg bg-brand-coral/10 flex items-center justify-center transition-transform"
                      style={{
                        transform:
                          hoveredCard === "flashcards"
                            ? "scale(1.2) rotate(-10deg)"
                            : "scale(1)",
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-brand-coral" />
                    </div>
                    <h3 className="font-semibold text-brand-navy text-sm">
                      Flashcards
                    </h3>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-2 bg-brand-coral/20 rounded w-full" />
                    <div className="h-2 bg-brand-coral/20 rounded w-2/3" />
                  </div>
                  <div
                    className="text-xs text-slate-600 transition-all duration-300 overflow-hidden"
                    style={{
                      opacity: hoveredCard === "flashcards" ? 1 : 0,
                      maxHeight: hoveredCard === "flashcards" ? "100px" : "0px",
                      transform:
                        hoveredCard === "flashcards"
                          ? "translateY(0)"
                          : "translateY(-10px)",
                    }}
                  >
                    <p className="font-semibold text-brand-coral mb-1">
                      Spaced repetition ready
                    </p>
                    <p>
                      Hundreds of AI-generated cards optimized for long-term
                      retention
                    </p>
                  </div>
                </div>

                {/* Quiz Card */}
                <div
                  className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 cursor-pointer transition-all duration-300 overflow-hidden"
                  style={{
                    transform:
                      hoveredCard === "quiz"
                        ? "translateX(20px) scale(1.05) rotate(0deg)"
                        : "translateX(0) scale(1) -rotate-1",
                    boxShadow:
                      hoveredCard === "quiz"
                        ? "0 20px 25px -5px rgba(54, 44, 93, 0.3)"
                        : "rgba(0, 0, 0, 0.1) 0 10px 15px -3px",
                  }}
                  onMouseEnter={() => setHoveredCard("quiz")}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg bg-brand-navy/10 flex items-center justify-center transition-transform"
                      style={{
                        transform:
                          hoveredCard === "quiz"
                            ? "scale(1.2) rotate(10deg)"
                            : "scale(1)",
                      }}
                    >
                      <Brain className="w-5 h-5 text-brand-navy" />
                    </div>
                    <h3 className="font-semibold text-brand-navy text-sm">
                      Quiz
                    </h3>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-2 bg-brand-navy/10 rounded w-full" />
                    <div className="h-2 bg-brand-navy/10 rounded w-1/3" />
                  </div>
                  <div
                    className="text-xs text-slate-600 transition-all duration-300 overflow-hidden"
                    style={{
                      opacity: hoveredCard === "quiz" ? 1 : 0,
                      maxHeight: hoveredCard === "quiz" ? "100px" : "0px",
                      transform:
                        hoveredCard === "quiz"
                          ? "translateY(0)"
                          : "translateY(-10px)",
                    }}
                  >
                    <p className="font-semibold text-brand-navy mb-1">
                      Test your knowledge
                    </p>
                    <p>
                      Multiple-choice questions with instant feedback and
                      explanations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ UPLOAD FLOW SECTION ============ */}
      <section className="py-14 rounded-md m-10 border-t border-orange-300">
        <div className=" container mx-auto px-6">
          <div className=" max-w-3xl mx-auto text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: "#362c5d" }}
            >
              Simple Three-Step Process
            </h2>
            <p className="text-slate-600 text-lg">
              From video to complete study materials in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {[
              {
                step: "1",
                title: "Upload Video",
                icon: Upload,
                desc: "Drop your lecture video or slides",
              },
              {
                step: "2",
                title: "AI Processes",
                icon: Zap,
                desc: "Our AI extracts and organizes content",
              },
              {
                step: "3",
                title: "Study Pack Ready",
                icon: CheckCircle2,
                desc: "Get notes, flashcards, and quizzes",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full bg-opacity-5 border-2 flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(54, 44, 93, 0.05)",
                      borderColor: "rgba(54, 44, 93, 0.2)",
                    }}
                  >
                    <item.icon
                      className="w-10 h-10"
                      style={{ color: "#362c5d" }}
                    />
                  </div>
                </div>
                <div
                  className="text-5xl font-bold opacity-20 mb-2"
                  style={{ color: "#c84449" }}
                >
                  {item.step}
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "#362c5d" }}
                >
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="max-w-2xl mx-auto h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full"
              style={{ backgroundColor: "#c84449", width: "66%" }}
            />
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE SECTION ============ */}
      <section
        className="py-14 rounded-md m-10 border-t border-orange-300"
        style={{ backgroundColor: "#f8f6fa" }}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: "#362c5d" }}
            >
              Why Choose LectureIQ?
            </h2>
            <p className="text-slate-600 text-lg">
              Built for modern learners who value efficiency and retention
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Lightning-Fast Processing",
                desc: "Most lectures process in 2-5 minutes, not days. Get your study materials immediately.",
                icon: Zap,
              },
              {
                title: "Smart Learning Tools",
                desc: "Adaptive flashcards and intelligent quizzes that target your specific learning gaps.",
                icon: Brain,
              },
              {
                title: "Organized Content",
                desc: "Section-based navigation with perfectly aligned notes, slides, and timestamps.",
                icon: Layers,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-lg transition"
                style={{ borderColor: "rgba(54, 44, 93, 0.1)" }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: "rgba(200, 68, 73, 0.1)" }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: "#c84449" }}
                  />
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: "#362c5d" }}
                >
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ UPLOAD FORM SECTION ============ */}
      <section
        id="upload-form"
        className="py-24 border-t border-slate-200 relative overflow-hidden"
      >
        <CircleMotif className="bottom-10 right-0 w-96 h-96 transform translate-x-1/4" />
        <CircleMotif className="top-10 left-0 w-96 h-96 transform -translate-x-1/4" />

        <div className="container mx-auto px-6 relative z-10">
          <UploadForm />
        </div>
      </section>

      {/* ============ STUDY PACK PREVIEW ============ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <CircleMotif className="top-1/2 -right-32 w-96 h-96 transform -translate-y-1/2" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: "#362c5d" }}
            >
              Your Generated Study Pack
            </h2>
            <p className="text-slate-600">
              Everything you need to master the material in one beautiful
              dashboard
            </p>
          </div>

          <StudyPackShowcase />
        </div>
      </section>
    </div>
  );
}
