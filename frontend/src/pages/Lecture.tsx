import { useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Zap, CheckSquare, Loader2, Download, Check, X, Clock, ChevronLeft, ChevronRight, Tag, FileText, Trophy, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { getLecture } from '../api/client'
import type { Lecture as LectureType } from '../utils/db'

const BrandColors = {
  navy: '#362c5d',
  coral: '#c84449',
  'coral-light': '#f5f0f0',
  'navy-light': '#f8f6fa',
}

type KeyTerm = {
  term: string
  definition: string
}

function stripMarkdown(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1$2')
    .replace(/^#+\s*/g, '')
    .replace(/^[-*]\s+/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractKeyTerms(notes?: string): KeyTerm[] {
  if (!notes) return []

  const lines = notes.split('\n')
  const terms = new Map<string, string>()

  lines.forEach((line) => {
    const matches = [...line.matchAll(/\*\*(.+?)\*\*/g)]
    if (matches.length === 0) return

    matches.forEach((match) => {
      const term = match[1].trim()
      if (term.length < 3 || term.length > 40) return
      if (terms.has(term)) return

      let definition = stripMarkdown(line.replace(match[0], '')).replace(/^:\s*/, '')
      if (!definition) {
        definition = 'Key term from the lecture notes.'
      }

      terms.set(term, definition)
    })
  })

  if (terms.size === 0) {
    for (let i = 0; i < lines.length; i += 1) {
      const headingMatch = lines[i].trim().match(/^#{2,3}\s+(.*)$/)
      if (!headingMatch) continue

      const term = stripMarkdown(headingMatch[1])
      if (!term || terms.has(term)) continue

      let definition = ''
      for (let j = i + 1; j < lines.length; j += 1) {
        const candidate = stripMarkdown(lines[j])
        if (candidate) {
          definition = candidate
          break
        }
      }

      terms.set(term, definition || 'Key term from the lecture notes.')
    }
  }

  return Array.from(terms.entries()).map(([term, definition]) => ({ term, definition }))
}

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

function shuffleQuizOptions(quiz: LectureType['quiz']) {
  if (!quiz) return []
  return quiz.map((q) => {
    const indexed = q.options.map((option, index) => ({ option, index }))
    const shuffled = shuffleArray(indexed)
    const newOptions = shuffled.map((item) => item.option)
    const newCorrectIndex = shuffled.findIndex((item) => item.index === q.correct_answer)

    return {
      ...q,
      options: newOptions,
      correct_answer: newCorrectIndex,
    }
  })
}



function exportLecturePdf(lecture: LectureType, keyTerms: KeyTerm[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 72
  const maxWidth = pageWidth - margin * 2
  let cursorY = margin
  const colors = {
    navy: [54, 44, 93],
    coral: [200, 68, 73],
    slate: [55, 65, 81],
    light: [248, 246, 250],
    pale: [254, 247, 247],
  } as const

  const addPageIfNeeded = (nextHeight: number) => {
    if (cursorY + nextHeight > pageHeight - margin) {
      doc.addPage()
      cursorY = margin
    }
  }

  const addHeader = () => {
    doc.setFillColor(...colors.navy)
    doc.rect(0, 0, pageWidth, 120, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    const titleLines = doc.splitTextToSize(lecture.title, pageWidth - margin * 2)
    doc.text(titleLines, margin, 48)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('LectureIQ Study Guide', margin, 90)
    doc.setTextColor(17, 24, 39)
    cursorY = 140
  }

  const addSectionTitle = (text: string) => {
    addPageIfNeeded(34)
    doc.setFillColor(...colors.light)
    doc.rect(margin, cursorY - 18, maxWidth, 24, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...colors.navy)
    doc.text(text.toUpperCase(), margin + 8, cursorY - 2)
    cursorY += 18
  }



  const addSubheading = (text: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...colors.coral)
    const lines = doc.splitTextToSize(text, maxWidth)
    const height = lines.length * 14
    addPageIfNeeded(height + 10)
    doc.text(lines, margin, cursorY)
    cursorY += height + 10
  }

  const addParagraph = (text: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...colors.slate)
    const lines = doc.splitTextToSize(text, maxWidth)
    const height = lines.length * 14
    addPageIfNeeded(height + 8)
    doc.text(lines, margin, cursorY)
    cursorY += height + 8
  }

  const addBullet = (text: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...colors.slate)
    const lines = doc.splitTextToSize(text, maxWidth - 12)
    const height = lines.length * 14
    addPageIfNeeded(height + 8)
    doc.setFillColor(...colors.coral)
    doc.circle(margin + 3, cursorY - 4, 2, 'F')
    doc.text(lines, margin + 12, cursorY)
    cursorY += height + 8
  }

  const addCallout = (title: string, body: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    const titleLines = doc.splitTextToSize(title, maxWidth - 24)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const bodyLines = doc.splitTextToSize(body, maxWidth - 24)
    const height = (titleLines.length + bodyLines.length) * 14 + 20

    addPageIfNeeded(height + 8)
    doc.setFillColor(...colors.pale)
    doc.roundedRect(margin, cursorY - 8, maxWidth, height, 8, 8, 'F')
    doc.setTextColor(...colors.navy)
    doc.setFont('helvetica', 'bold')
    doc.text(titleLines, margin + 12, cursorY + 6)
    doc.setTextColor(...colors.slate)
    doc.setFont('helvetica', 'normal')
    doc.text(bodyLines, margin + 12, cursorY + 6 + titleLines.length * 14)
    cursorY += height + 12
  }

  const addQaCard = (label: string, content: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    const header = `${label}:`
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const contentLines = doc.splitTextToSize(content, maxWidth - 24)
    const height = contentLines.length * 14 + 26

    addPageIfNeeded(height + 8)
    doc.setFillColor(...colors.light)
    doc.roundedRect(margin, cursorY - 6, maxWidth, height, 8, 8, 'F')
    doc.setTextColor(...colors.navy)
    doc.setFont('helvetica', 'bold')
    doc.text(header, margin + 12, cursorY + 10)
    doc.setTextColor(...colors.slate)
    doc.setFont('helvetica', 'normal')
    doc.text(contentLines, margin + 12, cursorY + 26)
    cursorY += height + 10
  }

  addHeader()
  addParagraph(`Lecture ID: ${lecture.id || ''}`.trim())

  addSectionTitle('Study Notes')
  if (lecture.notes) {
    lecture.notes.split('\n').forEach((line) => {
      const trimmed = stripMarkdown(line)
      if (!trimmed) {
        cursorY += 6
        return
      }
      if (trimmed === '---') {
        cursorY += 8
        return
      }
      if (/^Introduction:|^Trend\s\d+:|^Key Concept:|^Context:|^Mechanism:|^Benefits:|^Problem Decomposition:/i.test(trimmed)) {
        addSubheading(trimmed)
        return
      }
      if (/^[-*]\s+/.test(line)) {
        addBullet(trimmed.replace(/^[-*]\s+/, ''))
        return
      }
      addParagraph(trimmed)
    })
  } else {
    addParagraph('No notes available.')
  }

  addSectionTitle('Key Terms')
  if (keyTerms.length > 0) {
    keyTerms.forEach((term) => {
      addCallout(term.term, term.definition)
    })
  } else {
    addParagraph('No key terms available.')
  }

  addSectionTitle('Flashcards')
  if (lecture.flashcards && lecture.flashcards.length > 0) {
    lecture.flashcards.forEach((card, index) => {
      addSubheading(`Card ${index + 1}`)
      addQaCard('Question', card.question)
      addQaCard('Answer', card.answer)
    })
  } else {
    addParagraph('No flashcards available.')
  }

  addSectionTitle('Quick Check')
  if (lecture.quiz && lecture.quiz.length > 0) {
    lecture.quiz.forEach((q, index) => {
      addSubheading(`Question ${index + 1}`)
      addParagraph(q.question)
      q.options.forEach((option, optIndex) => {
        const label = String.fromCharCode(65 + optIndex)
        const prefix = optIndex === q.correct_answer ? `${label}. ${option} (correct)` : `${label}. ${option}`
        addBullet(prefix)
      })
      if (q.explanation) {
        addCallout('Why this is correct', q.explanation)
      }
    })
  } else {
    addParagraph('No quiz questions available.')
  }

  doc.save(`${lecture.title.replace(/\s+/g, '_')}_lecture.pdf`)
}

export default function Lecture() {
  const { id } = useParams()
  const [lecture, setLecture] = useState<LectureType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quiz' | 'terms'>('notes')
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [quizItems, setQuizItems] = useState<Array<{ question: string, options: string[], correct_answer: number, explanation?: string }>>([])
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({})
  const [isShowingResults, setIsShowingResults] = useState(false)
  const [quizTimeElapsed, setQuizTimeElapsed] = useState<number | null>(null)
  const [hasQuizStarted, setHasQuizStarted] = useState(false)
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null)
  const keyTerms = extractKeyTerms(lecture?.notes)

  useEffect(() => {
    const fetchLecture = async () => {
      if (!id) return
      
      try {
        setIsLoading(true)
        const data = await getLecture(id)
        
        if (!data) {
          setError('Lecture not found')
          return
        }
        
        setLecture(data)
        setQuizItems(shuffleQuizOptions(data.quiz))
        setQuizAnswers({})
        setIsShowingResults(false)
        setHasQuizStarted(false)
        setQuizTimeElapsed(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading lecture')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLecture()
  }, [id])

  // Timer effect for quiz
  useEffect(() => {
    if (!hasQuizStarted || isShowingResults) return
    
    const timer = setInterval(() => {
      setQuizTimeElapsed((prev) => {
        if (prev === null) return 0
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasQuizStarted, isShowingResults])

  useEffect(() => {
    const isLocked = hasQuizStarted && !isShowingResults
    document.body.classList.toggle('quiz-lock', isLocked)
    return () => {
      document.body.classList.remove('quiz-lock')
    }
  }, [hasQuizStarted, isShowingResults])

  return (
    <>
      <style>{`
        /* Tab active state indicator */
        .tab-active { 
          border-bottom: 3px solid #c84449; 
          background-color: rgba(200, 68, 73, 0.05); 
        }
        
        /* Quiz option selected state */
        .option-selected { 
          background-color: rgba(200, 68, 73, 0.1); 
          border-color: #c84449; 
        }
        
        /* Flashcard flip animation */
        .flip-card { perspective: 1000px; }
        .flip-card-inner { 
          transition: transform 0.6s; 
          transform-style: preserve-3d; 
        }
        .flip-card-inner.flipped { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back { backface-visibility: hidden; }
        .flip-card-back { transform: rotateY(180deg); }
        
        /* Hide scrollbar for horizontal tab navigation on mobile */
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        .overflow-x-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {isLoading ? (
        <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BrandColors.navy }} />
            <p className="text-slate-600">Loading lecture...</p>
          </div>
        </div>
      ) : error || !lecture ? (
        <div className="container mx-auto px-6 py-12">
          <Link to="/my-lectures" className="inline-flex items-center gap-2 mb-6" style={{ color: BrandColors.navy }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Lectures</span>
          </Link>
          <div className="rounded-lg p-6" style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #dc2626' }}>
            <p style={{ color: '#991b1b' }}>{error || 'Lecture not found'}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white min-h-screen">
          {/* HEADER - Mobile Optimized */}
          <div className="border-b border-slate-200" style={{ backgroundColor: BrandColors['navy-light'] }}>
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
              {/* Back Navigation - Min 44px tap target */}
              <Link
                to="/my-lectures"
                className={`inline-flex items-center gap-2 mb-6 sm:mb-8 min-h-[44px] ${hasQuizStarted && !isShowingResults ? 'pointer-events-none opacity-50' : ''}`}
                style={{ color: BrandColors.navy }}
                aria-disabled={hasQuizStarted && !isShowingResults}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Back to Lectures</span>
              </Link>

              {/* Title and Export - Stacked on mobile */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 mb-6">
                <div className="flex-1">
                  {/* Title - Responsive sizing: 24px mobile, 32px tablet, 48px desktop */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight break-words" style={{ color: BrandColors.navy }}>
                    {lecture.title}
                  </h1>
                  {/* Metadata - Better wrapping on mobile */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                    {/* Truncated ID on mobile, full on desktop */}
                    <span className="flex items-center gap-1">
                      <span className="hidden sm:inline">ID:</span>
                      <span className="sm:hidden font-mono text-[10px] bg-slate-100 px-2 py-1 rounded">
                        {id?.slice(0, 8)}...
                      </span>
                      <span className="hidden sm:inline font-mono text-xs break-all">{id}</span>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{lecture.flashcards?.length ?? 0} flashcards</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">{lecture.quiz?.length ?? 0} quizzes</span>
                  </div>
                </div>
                {/* Export Button - Full width on small screens, auto on larger */}
                <button
                  onClick={() => exportLecturePdf(lecture, keyTerms)}
                  disabled={hasQuizStarted && !isShowingResults}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 min-h-[44px] text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-2xl hover:opacity-90 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: BrandColors.coral }}
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION - Horizontal scroll on mobile */}
          <div className="border-b border-slate-200 sticky top-0 z-40 bg-white shadow-sm">
            <div className="container mx-auto px-4 sm:px-6">
              {/* Scrollable tab container with proper touch targets */}
              <div className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-px">
                {/* Notes Tab */}
                <button
                  onClick={() => { setActiveTab('notes'); setFlipped(false); setIsShowingResults(false); }}
                  disabled={hasQuizStarted && !isShowingResults}
                  className={`py-3 sm:py-4 px-3 sm:px-4 font-medium transition border-b-4 flex items-center gap-2 whitespace-nowrap min-h-[44px] flex-shrink-0 ${ activeTab === 'notes' ? 'tab-active' : 'border-transparent text-slate-600 hover:text-slate-900' } ${hasQuizStarted && !isShowingResults ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ borderBottomColor: activeTab === 'notes' ? BrandColors.coral : 'transparent', color: activeTab === 'notes' ? BrandColors.navy : undefined }}
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Notes</span>
                </button>
                
                {/* Flashcards Tab */}
                <button
                  onClick={() => { setActiveTab('flashcards'); setFlipped(false); setIsShowingResults(false); }}
                  disabled={hasQuizStarted && !isShowingResults}
                  className={`py-3 sm:py-4 px-3 sm:px-4 font-medium transition border-b-4 flex items-center gap-2 whitespace-nowrap min-h-[44px] flex-shrink-0 ${ activeTab === 'flashcards' ? 'tab-active' : 'border-transparent text-slate-600 hover:text-slate-900' } ${hasQuizStarted && !isShowingResults ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ borderBottomColor: activeTab === 'flashcards' ? BrandColors.coral : 'transparent', color: activeTab === 'flashcards' ? BrandColors.navy : undefined }}
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Flashcards</span>
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                    {lecture.flashcards?.length ?? 0}
                  </span>
                </button>
                
                {/* Quiz Tab */}
                <button
                  onClick={() => { setActiveTab('quiz'); setFlipped(false); }}
                  className={`py-3 sm:py-4 px-3 sm:px-4 font-medium transition border-b-4 flex items-center gap-2 whitespace-nowrap min-h-[44px] flex-shrink-0 ${ activeTab === 'quiz' ? 'tab-active' : 'border-transparent text-slate-600 hover:text-slate-900' }`}
                  style={{ borderBottomColor: activeTab === 'quiz' ? BrandColors.coral : 'transparent', color: activeTab === 'quiz' ? BrandColors.navy : undefined }}
                >
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Quiz</span>
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                    {lecture.quiz?.length ?? 0}
                  </span>
                </button>
                
                {/* Key Terms Tab */}
                <button
                  onClick={() => { setActiveTab('terms'); setFlipped(false); setIsShowingResults(false); }}
                  disabled={hasQuizStarted && !isShowingResults}
                  className={`py-3 sm:py-4 px-3 sm:px-4 font-medium transition border-b-4 flex items-center gap-2 whitespace-nowrap min-h-[44px] flex-shrink-0 ${ activeTab === 'terms' ? 'tab-active' : 'border-transparent text-slate-600 hover:text-slate-900' } ${hasQuizStarted && !isShowingResults ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ borderBottomColor: activeTab === 'terms' ? BrandColors.coral : 'transparent', color: activeTab === 'terms' ? BrandColors.navy : undefined }}
                >
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Key Terms</span>
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                    {keyTerms.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT - Mobile-first padding */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="max-w-5xl">
                {!lecture.notes || lecture.notes.trim() === '' ? (
                  <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 text-center" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                    <div className="flex items-center justify-center gap-2 font-medium" style={{ color: '#92400e' }}>
                      <FileText className="w-5 h-5" />
                      <span className="text-sm sm:text-base">No notes available</span>
                    </div>
                    <p style={{ color: '#b45309' }} className="text-xs sm:text-sm mt-1">Notes will appear once processing is complete</p>
                  </div>
                ) : (
                  <div className="rounded-xl sm:rounded-2xl border bg-white shadow-sm p-4 sm:p-6 md:p-8 lg:p-10" style={{ borderColor: 'rgba(54, 44, 93, 0.12)' }}>
                    <div className="space-y-4 sm:space-y-6">
                      {lecture.notes.split('\n').map((line, idx) => {
                        const trimmed = line.trim()
                        if (!trimmed) return <div key={idx} className="h-2 sm:h-3" />

                        const formatInline = (value: string) =>
                          value
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')

                        if (trimmed === '---') {
                          return (
                            <div
                              key={idx}
                              className="border-t"
                              style={{ borderColor: 'rgba(54, 44, 93, 0.12)' }}
                            />
                          )
                        }

                        // H1 - Main title: 20px mobile, 24px tablet, 28px desktop
                        if (trimmed.startsWith('# ')) {
                          const text = formatInline(trimmed.replace('# ', ''))
                          return (
                            <div key={idx} className="rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-md" style={{ backgroundColor: BrandColors.navy }}>
                              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight" dangerouslySetInnerHTML={{ __html: text }} />
                            </div>
                          )
                        }

                        // H2 - Section headings: 18px mobile, 20px tablet, 24px desktop
                        if (trimmed.startsWith('## ')) {
                          const text = formatInline(trimmed.replace('## ', ''))
                          return (
                            <div key={idx} className="flex items-center gap-2 sm:gap-3">
                              <div className="w-1 sm:w-1.5 h-6 sm:h-8 rounded-full flex-shrink-0" style={{ backgroundColor: BrandColors.coral }} />
                              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold break-words" style={{ color: BrandColors.navy }} dangerouslySetInnerHTML={{ __html: text }} />
                            </div>
                          )
                        }

                        // H3 - Subsection headings: 16px mobile, 18px desktop
                        if (trimmed.startsWith('### ')) {
                          const text = formatInline(trimmed.replace('### ', ''))
                          return (
                            <h3 key={idx} className="text-base sm:text-lg font-semibold break-words" style={{ color: BrandColors.navy }} dangerouslySetInnerHTML={{ __html: text }} />
                          )
                        }

                        // Bullet points - proper indentation and spacing
                        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                          const text = formatInline(trimmed.replace(/^[-*]\s+/, ''))
                          return (
                            <div key={idx} className="flex gap-2 sm:gap-3 ml-1 sm:ml-2">
                              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" style={{ backgroundColor: BrandColors.coral }} />
                              <p className="text-slate-700 leading-relaxed text-sm sm:text-base break-words" dangerouslySetInnerHTML={{ __html: text }} />
                            </div>
                          )
                        }

                        // Regular paragraphs - proper line height and wrapping
                        const text = formatInline(trimmed)
                        return (
                          <p
                            key={idx}
                            className="text-slate-700 leading-relaxed text-sm sm:text-base border-l-2 sm:border-l-4 pl-3 sm:pl-4 break-words"
                            style={{ borderColor: BrandColors.coral + '30' }}
                            dangerouslySetInnerHTML={{ __html: text }}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* KEY TERMS TAB - Mobile grid adjustments */}
            {activeTab === 'terms' && (
              <div className="max-w-5xl">
                {keyTerms.length === 0 ? (
                  <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 text-center" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                    <div className="flex items-center justify-center gap-2" style={{ color: '#92400e' }}>
                      <Tag className="w-5 h-5" />
                      <p className="font-medium text-sm sm:text-base">No key terms available</p>
                    </div>
                    <p style={{ color: '#b45309' }} className="text-xs sm:text-sm mt-1">Key terms are generated from your notes</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {keyTerms.map((term) => {
                      const isOpen = expandedTermId === term.term
                      return (
                        <button
                          key={term.term}
                          onClick={() => setExpandedTermId(isOpen ? null : term.term)}
                          className="text-left rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-5 md:p-6 shadow-sm transition hover:shadow-md min-h-[44px]"
                          style={{ borderColor: 'rgba(54, 44, 93, 0.12)' }}
                        >
                          <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] sm:text-xs uppercase tracking-widest mb-2 font-semibold" style={{ color: BrandColors.coral }}>
                                Key Term
                              </p>
                              <h3 className="text-base sm:text-lg font-semibold break-words" style={{ color: BrandColors.navy }}>
                                {term.term}
                              </h3>
                            </div>
                            <span
                              className="text-[10px] sm:text-xs px-2 py-1 rounded-full border whitespace-nowrap flex-shrink-0"
                              style={{ borderColor: BrandColors.coral + '40', color: BrandColors.coral }}
                            >
                              {isOpen ? 'Hide' : 'Reveal'}
                            </span>
                          </div>
                          {isOpen && (
                            <div className="mt-3 sm:mt-4 border-t pt-3 sm:pt-4" style={{ borderColor: 'rgba(54, 44, 93, 0.12)' }}>
                              <p className="text-slate-700 leading-relaxed text-sm sm:text-base break-words">
                                {term.definition}
                              </p>
                              <p className="text-[10px] sm:text-xs mt-2 sm:mt-3" style={{ color: '#64748b' }}>
                                Quick recall: explain this term in your own words.
                              </p>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* FLASHCARDS TAB - Mobile optimized */}
            {activeTab === 'flashcards' && (
              <div className="max-w-2xl mx-auto">
                {lecture.flashcards && lecture.flashcards.length > 0 ? (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Flashcard - Responsive height and padding */}
                    <div className="flip-card" style={{ minHeight: '280px' }}>
                      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`} style={{ position: 'relative', minHeight: '280px' }}>
                        {/* Front */}
                        <div
                          onClick={() => setFlipped(!flipped)}
                          className="absolute inset-0 w-full rounded-xl sm:rounded-2xl border-2 p-6 sm:p-8 md:p-12 cursor-pointer flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition overflow-hidden"
                          style={{ backgroundColor: '#ffffff', borderColor: BrandColors.coral + '30', backfaceVisibility: 'hidden' }}
                        >
                          <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6 font-medium">Click to reveal answer</p>
                          <div className="text-center w-full">
                            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 mb-3 sm:mb-4 font-semibold" style={{ color: BrandColors.navy }}>Question</p>
                            <div className="max-h-48 sm:max-h-60 overflow-y-auto px-2 scrollbar-hide">
                              <p className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed break-words" style={{ color: BrandColors.navy }}>
                                {lecture.flashcards[currentFlashcard].question}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Back */}
                        <div
                          onClick={() => setFlipped(!flipped)}
                          className="absolute inset-0 w-full rounded-xl sm:rounded-2xl border-2 p-6 sm:p-8 md:p-12 cursor-pointer flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition overflow-hidden"
                          style={{
                            backgroundColor: BrandColors['coral-light'],
                            borderColor: BrandColors.coral + '50',
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <p className="text-xs sm:text-sm mb-4 sm:mb-6 font-medium" style={{ color: BrandColors.coral }}>Click to see question</p>
                          <div className="text-center w-full">
                            <p className="text-[10px] sm:text-xs uppercase tracking-widest mb-3 sm:mb-4 font-semibold" style={{ color: BrandColors.coral }}>Answer</p>
                            <div className="max-h-48 sm:max-h-60 overflow-y-auto px-2 scrollbar-hide">
                              <p className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed break-words" style={{ color: BrandColors.navy }}>
                                {lecture.flashcards[currentFlashcard].answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress and Navigation - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mt-4">
                      <button
                        onClick={() => { setCurrentFlashcard(Math.max(0, currentFlashcard - 1)); setFlipped(false); }}
                        disabled={currentFlashcard === 0}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                        style={{ backgroundColor: '#f3f4f6', color: BrandColors.navy }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-semibold text-slate-600">
                          {currentFlashcard + 1} of {lecture.flashcards?.length ?? 0}
                        </span>
                        <div className="flex gap-1 sm:gap-1.5">
                          {lecture.flashcards.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => { setCurrentFlashcard(i); setFlipped(false); }}
                              className="rounded-full transition"
                              style={{
                                width: i === currentFlashcard ? '24px' : '6px',
                                height: '6px',
                                minHeight: '6px',
                                backgroundColor: i === currentFlashcard ? BrandColors.coral : '#e5e7eb'
                              }}
                              aria-label={`Go to flashcard ${i + 1}`}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => { setCurrentFlashcard(Math.min((lecture.flashcards?.length ?? 0) - 1, currentFlashcard + 1)); setFlipped(false); }}
                        disabled={currentFlashcard === (lecture.flashcards?.length ?? 0) - 1}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                        style={{ backgroundColor: '#f3f4f6', color: BrandColors.navy }}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-slate-500 text-base sm:text-lg">No flashcards available</p>
                  </div>
                )}
              </div>
            )}

            {/* QUIZ TAB - Mobile optimized */}
            {activeTab === 'quiz' && (
              <div className="max-w-3xl">
                {quizItems.length > 0 ? (
                  <>
                    {!isShowingResults ? (
                      <div className="space-y-6 sm:space-y-8">
                        {/* Progress Card - Stack elements on mobile */}
                        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 text-base sm:text-lg">Quiz Progress</h3>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                              Answered: {Object.keys(quizAnswers).length} of {quizItems.length}
                            </p>
                          </div>
                          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full border w-full sm:w-auto justify-center sm:justify-start" style={{ backgroundColor: BrandColors['navy-light'], borderColor: 'rgba(54, 44, 93, 0.15)' }}>
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BrandColors.navy }} />
                              <span className="font-semibold text-sm sm:text-base" style={{ color: BrandColors.navy }}>
                                {`${Math.floor((quizTimeElapsed ?? 0) / 60)}:${String((quizTimeElapsed ?? 0) % 60).padStart(2, '0')}`}
                              </span>
                            </div>
                            {!hasQuizStarted ? (
                              <span className="text-[10px] sm:text-xs mt-1.5 sm:mt-1 text-center sm:text-right w-full" style={{ color: '#64748b' }}>
                                Timer starts on first answer
                              </span>
                            ) : (
                              <span className="text-[10px] sm:text-xs mt-1.5 sm:mt-1 text-center sm:text-right w-full" style={{ color: '#64748b' }}>
                                Navigation locked during quiz
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Questions - Better spacing and sizing */}
                        {quizItems.map((q, idx) => (
                          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                            <div>
                              <p className="text-xs sm:text-sm font-semibold mb-2" style={{ color: BrandColors.coral }}>
                                Question {idx + 1} of {quizItems.length}
                              </p>
                              <h3 className="text-base sm:text-lg font-bold break-words" style={{ color: BrandColors.navy }}>{q.question}</h3>
                            </div>

                            <div className="space-y-2">
                              {q.options.map((option, optIdx) => (
                                <label
                                  key={optIdx}
                                  className="flex items-start sm:items-center gap-3 p-3 sm:p-4 rounded-lg cursor-pointer transition border-2 min-h-[44px]"
                                  style={{
                                    backgroundColor: quizAnswers[idx] === optIdx ? 'rgba(200, 68, 73, 0.08)' : '#ffffff',
                                    borderColor: quizAnswers[idx] === optIdx ? BrandColors.coral : '#e5e7eb'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`q${idx}`}
                                    value={optIdx}
                                    checked={quizAnswers[idx] === optIdx}
                                    onChange={(e) => {
                                      if (!hasQuizStarted) setHasQuizStarted(true)
                                      setQuizAnswers({ ...quizAnswers, [idx]: Number(e.target.value) })
                                    }}
                                    className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-sm sm:text-base" style={{ color: BrandColors.navy }}>
                                      {String.fromCharCode(65 + optIdx)}.
                                    </span>
                                    <span className="ml-2 text-slate-700 text-sm sm:text-base break-words">{option}</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Action Buttons - Stack on mobile */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
                          <button
                            onClick={() => {
                              setQuizAnswers({})
                              setIsShowingResults(false)
                              setHasQuizStarted(false)
                              setQuizTimeElapsed(null)
                            }}
                            className="flex-1 px-5 sm:px-6 py-3 min-h-[44px] border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium text-sm sm:text-base"
                            style={{ color: BrandColors.navy }}
                          >
                            Clear All
                          </button>
                          <button
                            onClick={() => {
                              setIsShowingResults(true)
                              setHasQuizStarted(false)
                            }}
                            disabled={Object.keys(quizAnswers).length < quizItems.length}
                            className="flex-1 px-5 sm:px-6 py-3 min-h-[44px] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm sm:text-base"
                            style={{ backgroundColor: quizAnswers[Object.keys(quizAnswers).length < quizItems.length ? -1 : 0] ? BrandColors.coral : BrandColors.coral }}
                          >
                            Submit Quiz ({Object.keys(quizAnswers).length}/{quizItems.length})
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Results Header - Mobile optimized */}
                        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
                          {(() => {
                            const correct = quizItems.filter((q, idx) => quizAnswers[idx] === q.correct_answer).length
                            const percentage = Math.round((correct / quizItems.length) * 100)
                            const minutes = Math.floor((quizTimeElapsed || 0) / 60)
                            const seconds = (quizTimeElapsed || 0) % 60

                            return (
                              <>
                                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-4" style={{ backgroundColor: percentage >= 80 ? '#dcfce7' : percentage >= 60 ? '#fef3c7' : '#fee2e2' }}>
                                  <span className="text-3xl sm:text-4xl font-bold" style={{ color: percentage >= 80 ? '#166534' : percentage >= 60 ? '#92400e' : '#991b1b' }}>
                                    {percentage}%
                                  </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center justify-center gap-2" style={{ color: BrandColors.navy }}>
                                  {percentage >= 80 ? (
                                    <>
                                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                                      Great Job!
                                    </>
                                  ) : percentage >= 60 ? (
                                    <>
                                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                                      Good effort!
                                    </>
                                  ) : (
                                    <>
                                      <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
                                      Keep practicing!
                                    </>
                                  )}
                                </h2>
                                <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
                                  You got <strong style={{ color: BrandColors.navy }}>{correct} out of {quizItems.length}</strong> questions correct
                                </p>
                                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs sm:text-sm">
                                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  <span>Completed in {minutes}m {String(seconds).padStart(2, '0')}s</span>
                                </div>
                              </>
                            )
                          })()}
                        </div>

                        {/* Detailed Results - Better mobile readability */}
                        <div className="space-y-3 sm:space-y-4">
                          {quizItems.map((q, idx) => {
                            const isCorrect = quizAnswers[idx] === q.correct_answer
                            return (
                              <div
                                key={idx}
                                className="rounded-lg p-4 sm:p-5 md:p-6 border-l-4"
                                style={{
                                  borderLeftColor: isCorrect ? '#16a34a' : '#dc2626',
                                  backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2'
                                }}
                              >
                                <div className="flex gap-3 sm:gap-4">
                                  <div
                                    className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{ backgroundColor: isCorrect ? '#16a34a' : '#dc2626' }}
                                  >
                                    {isCorrect ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-semibold mb-2" style={{ color: isCorrect ? '#166534' : '#991b1b' }}>
                                      Question {idx + 1} {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                    </p>
                                    <p className="font-medium mb-3 text-sm sm:text-base break-words" style={{ color: BrandColors.navy }}>{q.question}</p>

                                    <div className="bg-white rounded p-3 space-y-2 text-xs sm:text-sm">
                                      <div>
                                        <p className="text-slate-600 break-words">
                                          <span className="font-semibold">Your answer:</span>{' '}
                                          {String.fromCharCode(65 + quizAnswers[idx])}. {q.options[quizAnswers[idx]]}
                                        </p>
                                      </div>
                                      {!isCorrect && (
                                        <div className="pt-2 border-t border-slate-200">
                                          <p className="text-slate-600 break-words">
                                            <span className="font-semibold" style={{ color: '#16a34a' }}>Correct answer:</span>
                                            <span className="ml-1 font-medium" style={{ color: '#16a34a' }}>
                                              {String.fromCharCode(65 + q.correct_answer)}. {q.options[q.correct_answer]}
                                            </span>
                                          </p>
                                        </div>
                                      )}
                                      {q.explanation && (
                                        <div className="pt-2 border-t border-slate-200">
                                          <p className="text-slate-600 break-words">
                                            <span className="font-semibold">Explanation:</span> {q.explanation}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => {
                            setQuizAnswers({})
                            setIsShowingResults(false)
                            setHasQuizStarted(false)
                            setQuizTimeElapsed(null)
                          }}
                          className="w-full px-5 sm:px-6 py-3 min-h-[44px] text-white rounded-lg hover:opacity-90 transition font-medium text-sm sm:text-base"
                          style={{ backgroundColor: BrandColors.navy }}
                        >
                          Retake Quiz
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-slate-500 text-base sm:text-lg">No quiz questions available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
