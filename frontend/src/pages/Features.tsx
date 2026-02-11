import { ArrowRight, Zap, Brain, Layers, Clock, Shield, BarChart3, Smartphone, Download } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning-Fast Processing',
      desc: '2-5 minutes, not days. Get your study pack before you even leave class.',
      benefits: ['2-5 min processing', 'No waiting', 'Instant access']
    },
    {
      icon: Brain,
      title: 'Intelligent Extraction',
      desc: 'Our AI knows what matters. Removes fluff, keeps the essential concepts.',
      benefits: ['Key concepts only', 'Smart summarization', 'Never misses detail']
    },
    {
      icon: Layers,
      title: 'Complete Study Suite',
      desc: 'Notes + flashcards + quizzes in one upload. Everything you need, nothing extra.',
      benefits: ['Organized notes', 'Smart flashcards', 'Practice quizzes']
    },
    {
      icon: Clock,
      title: 'Spaced Repetition',
      desc: 'Scientifically-proven spaced repetition scheduling built into every flashcard.',
      benefits: ['Better retention', 'Optimal timing', 'Long-term memory']
    },
    {
      icon: Shield,
      title: 'Privacy First',
      desc: 'Your lectures are yours alone. Encrypted storage, zero tracking, no selling data.',
      benefits: ['Encrypted storage', 'Private by default', 'Your data only']
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      desc: 'See exactly what you\'ve learned with detailed performance analytics.',
      benefits: ['Performance charts', 'Weak area detection', 'Learning stats']
    },
    {
      icon: Smartphone,
      title: 'Works Everywhere',
      desc: 'Desktop, tablet, phone. Study anywhere, anytime, on any device.',
      benefits: ['Fully responsive', 'Cross-device sync', 'Web-based']
    },
    {
      icon: Download,
      title: 'Export to Anki',
      desc: 'Use your flashcards in Anki for maximum flexibility and power-user features.',
      benefits: ['Anki export', 'Custom decks', 'Third-party compatible']
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Left aligned, asymmetric */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <h1 className="font-serif text-6xl font-bold mb-6 leading-tight text-brand-navy">
              Built for how you actually learn
            </h1>
            <p className="text-xl text-slate-700 mb-2 font-light">
              No bloat. No features you don't need. Just smart tools that actually save you time.
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded transition-all duration-200 hover:shadow-lg active:scale-95 mt-8 bg-brand-navy"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid - Asymmetric layout */}
      <div className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            // Vary the span and heights for visual interest
            const isLarge = idx === 0 || idx === 2 || idx === 5
            
            return (
              <div 
                key={idx} 
                className={`bg-slate-50 rounded-lg border border-slate-200 p-8 transition-all duration-300 hover:shadow-lg hover:border-slate-300 hover:bg-white ${
                  isLarge && idx % 3 === 0 ? 'lg:col-span-1' : ''
                }`}
              >
                <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded bg-brand-emerald/10">
                  <Icon className="w-7 h-7 text-brand-emerald" />
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-brand-navy">
                  {feature.title}
                </h3>
                
                <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                  {feature.desc}
                </p>

                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-brand-emerald" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* How It Works - Simpler, more direct */}
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-2xl mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4 text-brand-navy">
              Three steps. That's it.
            </h2>
            <p className="text-lg text-slate-700 font-light">
              Upload. Process. Study.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl">
            {[
              {
                num: '1',
                title: 'Upload your lecture',
                desc: 'Video, audio, or transcript. Whatever format, we handle it.'
              },
              {
                num: '2',
                title: 'AI does the heavy lifting',
                desc: 'Smart extraction finds what matters. Organizes it perfectly.'
              },
              {
                num: '3',
                title: 'You study smarter',
                desc: 'Notes, flashcards, quizzes ready. Actually understand the material.'
              },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="mb-6">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded font-serif text-2xl font-bold text-brand-emerald bg-brand-emerald/10">
                    {step.num}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-brand-navy">
                  {step.title}
                </h3>
                
                <p className="text-slate-700 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table - cleaner */}
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mb-16">
          <h2 className="font-serif text-4xl font-bold mb-4 text-brand-navy">
            Why we're different
          </h2>
          <p className="text-lg text-slate-700 font-light">
            Side by side with other methods.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-brand-emerald">
                <th className="text-left py-4 px-6 font-bold text-brand-navy">Feature</th>
                <th className="text-center py-4 px-6 font-bold text-brand-navy">LectureIQ</th>
                <th className="text-center py-4 px-6 font-bold text-slate-600">Manual Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Time to create materials', '✓ 2-5 min', '✗ 2-3 hours'],
                ['Organized notes', '✓ Auto-structured', '✗ Your formatting'],
                ['Flashcards included', '✓ 300+ cards', '✗ Make manually'],
                ['Quiz problems', '✓ AI-generated', '✗ Not available'],
                ['Spaced repetition', '✓ Built-in', '✗ Manual only'],
                ['Access anywhere', '✓ Any device', '✗ Download dependent'],
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-4 px-6 font-medium text-brand-navy">{row[0]}</td>
                  <td className="py-4 px-6 text-center text-brand-emerald font-medium">{row[1]}</td>
                  <td className="py-4 px-6 text-center text-slate-500">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple CTA - no gradient */}
      <div className="bg-brand-navy text-white">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Try it now
            </h2>
            <p className="text-lg text-brand-emerald-light mb-8 font-light">
              No sign-up required. Upload a lecture right now and see it for yourself.
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded transition-all duration-200 hover:shadow-lg active:scale-95 border-2 border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-white"
            >
              Upload Your Lecture
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
