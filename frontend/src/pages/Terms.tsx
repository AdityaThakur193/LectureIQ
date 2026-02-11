export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#362c5d' }}>
              Terms of Service
            </h1>
            <p className="text-lg text-slate-600">
              These terms describe how you may use LectureIQ and what you can expect from the service.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              Acceptance
            </h2>
            <p className="text-slate-700 leading-relaxed">
              By using LectureIQ, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              Your Content
            </h2>
            <p className="text-slate-700 leading-relaxed">
              You own the lectures and transcripts you upload. You grant us permission to process them to generate
              study materials and deliver the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              Acceptable Use
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Do not upload content you do not have rights to use. Do not misuse the platform or attempt to disrupt it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              Service Changes
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We may update features over time. We will make reasonable efforts to keep the service available.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              Contact
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Questions about these terms? Reach us at athakur8@gitam.in.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
