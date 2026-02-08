import { BookOpen, FileText, Zap, HelpCircle, ArrowRight, Code, Shield, Cpu } from 'lucide-react'
import { useState } from 'react'

export default function Docs() {
  const [activeDoc, setActiveDoc] = useState<string | null>(null)

  const documentation = {
    'Getting Started': {
      icon: BookOpen,
      content: [
        {
          title: 'Installation',
          desc: 'Set up LectureIQ in minutes',
          details: 'No installation required! LectureIQ is a web-based platform. Simply visit our website, create an account, and start uploading your lectures immediately.'
        },
        {
          title: 'Quick Start',
          desc: 'Create your first study pack',
          details: 'Upload an audio file or transcript, let our AI process it, and receive comprehensive study materials including notes, flashcards, and a quiz within minutes.'
        },
        {
          title: 'Dashboard Tour',
          desc: 'Navigate the interface',
          details: 'Your dashboard displays all your lectures and study packs. Click any lecture to access notes, flashcards, and quizzes. Use the search bar to find specific content quickly.'
        },
      ]
    },
    'Features': {
      icon: Zap,
      content: [
        {
          title: 'Upload Lectures',
          desc: 'Import audio and transcripts',
          details: 'Upload MP3, WAV, or M4A files up to 500MB, or paste transcripts directly. Supports multiple formats for maximum flexibility.'
        },
        {
          title: 'AI Processing',
          desc: 'How we generate study materials',
          details: 'Our advanced AI analyzes lecture content to identify key concepts, create concise notes, generate flashcard pairs, and formulate quiz questions automatically.'
        },
        {
          title: 'Study Tools',
          desc: 'Notes, flashcards, and quizzes',
          details: 'Access organized notes with section headers, flip through interactive flashcards with spaced repetition support, and test your knowledge with comprehensive quizzes.'
        },
      ]
    },
    'API Reference': {
      icon: Code,
      content: [
        {
          title: 'Authentication',
          desc: 'Secure your requests',
          details: 'Use Bearer token authentication. Include your API key in the Authorization header: Authorization: Bearer YOUR_API_KEY'
        },
        {
          title: 'Endpoints',
          desc: 'Available API routes',
          details: 'POST /api/lectures - Create new lecture\nGET /api/lectures/:id - Retrieve lecture\nDELETE /api/lectures/:id - Delete lecture\nGET /api/lectures - List all lectures'
        },
        {
          title: 'Webhooks',
          desc: 'Real-time event notifications',
          details: 'Subscribe to events like lecture_processed, quiz_completed, and flashcard_generated. Configure webhook endpoints in your dashboard settings.'
        },
      ]
    },
    'Support': {
      icon: HelpCircle,
      content: [
        {
          title: 'FAQ',
          desc: 'Common questions answered',
          details: 'Q: How long does processing take? A: Usually 2-5 minutes\nQ: Can I edit study materials? A: Yes, all materials are fully editable\nQ: What file sizes are supported? A: Up to 500MB per upload'
        },
        {
          title: 'Troubleshooting',
          desc: 'Resolve common issues',
          details: 'If upload fails, check file format and size. For processing issues, ensure audio quality is clear. Clear browser cache if UI appears broken.'
        },
        {
          title: 'Contact Us',
          desc: 'Get help from our team',
          details: 'Email: contact@example.com | Chat: Available 24/7 | Phone: Contact support'
        },
      ]
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4" style={{color: '#362c5d'}}>
              Documentation
            </h1>
            <p className="text-lg text-slate-600">
              Everything you need to know about using LectureIQ. From uploading your first lecture to mastering our API.
            </p>
          </div>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="container mx-auto px-6 py-16">
        <div className="space-y-8 max-w-4xl">
          {Object.entries(documentation).map(([sectionTitle, section]) => {
            const Icon = section.icon
            return (
              <div key={sectionTitle} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition">
                {/* Section Header */}
                <div className="p-8 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{backgroundColor: 'rgba(200, 68, 73, 0.15)'}}>
                      <Icon className="w-8 h-8" style={{color: '#c84449'}} />
                    </div>
                    <h2 className="text-3xl font-bold" style={{color: '#362c5d'}}>
                      {sectionTitle}
                    </h2>
                  </div>
                </div>

                {/* Section Content */}
                <div className="divide-y divide-slate-200">
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      <button
                        onClick={() => setActiveDoc(activeDoc === `${sectionTitle}-${idx}` ? null : `${sectionTitle}-${idx}`)}
                        className="w-full p-6 hover:bg-slate-50 transition text-left flex items-start justify-between gap-4"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1" style={{color: '#362c5d'}}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-600">{item.desc}</p>
                        </div>
                        <ArrowRight 
                          className="w-5 h-5 mt-1 flex-shrink-0 transition transform"
                          style={{
                            color: '#c84449',
                            transform: activeDoc === `${sectionTitle}-${idx}` ? 'rotate(90deg)' : 'rotate(0)'
                          }}
                        />
                      </button>

                      {activeDoc === `${sectionTitle}-${idx}` && (
                        <div className="px-6 pb-6 bg-slate-50 border-t border-slate-200">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{item.details}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-slate-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{color: '#362c5d'}}>
              Still need help?
            </h2>
            <p className="text-slate-600 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <button 
              className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition transform hover:-translate-y-0.5 shadow-md"
              style={{backgroundColor: '#c84449'}}
            >
              Contact Support
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
