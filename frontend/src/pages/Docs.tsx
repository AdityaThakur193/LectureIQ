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
          details: 'Upload an audio file (MP3, WAV, M4A) or paste a transcript. Processing takes 2-5 minutes. You\'ll receive four interactive sections: formatted Notes, flippable Flashcards, a timed Quiz with shuffled options (A-D), and an interactive Key Terms glossary.'
        },
        {
          title: 'Dashboard Tour',
          desc: 'Navigate the interface',
          details: 'Your dashboard displays all lectures with search functionality. View statistics showing total lectures, completed count, flashcards generated, and quizzes taken. Export your entire library as JSON backup or import from previous exports. Click any lecture card to access all study materials.'
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
          details: 'Our AI analyzes lecture content to extract key concepts and generate four types of study materials: (1) Structured notes with markdown formatting, (2) Question-answer flashcard pairs, (3) Multiple-choice quiz questions with 4 options each, (4) Key terms with definitions. Processing completes in 2-5 minutes depending on lecture length.'
        },
        {
          title: 'Study Tools',
          desc: 'Four interactive learning sections',
          details: 'NOTES: Markdown-formatted with bold headings, italic emphasis, and bullet points. Export as comprehensive PDF study guide.\n\nFLASHCARDS: Flip cards to reveal answers. Export to CSV format compatible with Anki and other spaced-repetition apps.\n\nQUIZ: Multiple-choice with options A-D (shuffled per session). Timer tracks your progress. Navigation locked during active quiz to prevent cheating. View detailed results with correct/incorrect breakdown.\n\nKEY TERMS: Interactive glossary extracted from lecture notes. Click term cards to reveal definitions.'
        },
      ]
    },
    'API Reference': {
      icon: Code,
      content: [
        {
          title: 'Data Storage',
          desc: 'Local-first architecture',
          details: 'LectureIQ stores all data locally in your browser using IndexedDB. Your lectures, notes, flashcards, and quiz data never leave your device. No account or authentication required—your privacy is built-in.'
        },
        {
          title: 'Export Formats',
          desc: 'Take your data anywhere',
          details: 'PDF Export: Comprehensive study guide with all sections (Notes, Flashcards, Quiz, Key Terms) in a formatted layout with headers and callouts.\n\nCSV Export: Flashcards in two-column format (Question, Answer) compatible with Anki, Quizlet, and other flashcard apps.\n\nJSON Backup: Your entire lecture library can be exported and imported for data portability between devices.'
        },
        {
          title: 'Supported File Types',
          desc: 'Audio and text formats',
          details: 'Audio Files: MP3, WAV, M4A up to 500MB\nText Input: Direct transcript paste (no size limit)\nProcessing: Transcription and AI analysis completed in 2-5 minutes\nOutput: Organized study materials across four interactive sections'
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
          details: 'Email: athakur8@gitam.in | Chat: Available 24/7 '
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
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=athakur8@gitam.in&su=LectureIQ%20Support&body=Hi%20LectureIQ%20team%2C%0A%0A"
              target="_blank"
              className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition transform hover:-translate-y-0.5 shadow-md"
              style={{ backgroundColor: '#c84449' }}
            >
              Contact Support
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
