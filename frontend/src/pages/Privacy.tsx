export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#362c5d' }}>
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-600">
              We keep your data minimal, secure, and only use it to deliver your study materials.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              What We Collect
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We collect lecture files and transcripts you upload, generated study outputs, and basic account details.
              We also collect usage analytics to improve reliability and performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              How We Use Data
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Your data is used to process lectures, generate notes, flashcards, and quizzes, and provide access to your
              study library. We do not sell your content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              Storage and Security
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We protect your data with industry-standard security practices and only store what is needed to deliver
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              Your Choices
            </h2>
            <p className="text-slate-700 leading-relaxed">
              You can delete your lectures from the dashboard. If you need additional data removal, contact support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#362c5d' }}>
              Contact
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Questions about privacy? Reach us at athakur8@gitam.in.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
