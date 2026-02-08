import { useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Zap, CheckSquare, Loader2, Download, Check, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getLecture } from '../api/client'
import type { Lecture as LectureType } from '../utils/db'

const BrandColors = {
  navy: '#362c5d',
  coral: '#c84449',
  'coral-light': '#f5f0f0',
  'navy-light': '#f8f6fa',
}

// Export flashcards to CSV format compatible with Anki
function exportToAnki(lecture: LectureType) {
  if (!lecture.flashcards || lecture.flashcards.length === 0) {
    alert('No flashcards available to export')
    return
  }

  // CSV format: QUESTION\tANSWER (tab-separated)
  let csv = 'Question\tAnswer\n'

  lecture.flashcards.forEach((card) => {
    // Escape quotes and newlines in CSV
    const question = card.question.replace(/"/g, '""').replace(/\n/g, ' ')
    const answer = card.answer.replace(/"/g, '""').replace(/\n/g, ' ')
    csv += `"${question}"\t"${answer}"\n`
  })

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${lecture.title.replace(/\s+/g, '_')}_flashcards.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function Lecture() {
  const { id } = useParams()
  const [lecture, setLecture] = useState<LectureType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quiz'>('notes')
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [quizTime, setQuizTime] = useState<number | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    const fetchLecture = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const data = await getLecture(id)
        
        if (!data) {
          setError('Lecture not found')
          return
        }
        
        setLecture(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading lecture')
      } finally {
        setLoading(false)
      }
    }

    fetchLecture()
  }, [id])

  // Timer effect for quiz
  useEffect(() => {
    if (!quizStarted || showResults) return
    
    const timer = setInterval(() => {
      setQuizTime((prev) => {
        if (prev === null) return 0
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, showResults])

  return (
    <>
      <style>{`
        .tab-active { border-bottom: 3px solid #c84449; background-color: rgba(200, 68, 73, 0.05); }
        .option-selected { background-color: rgba(200, 68, 73, 0.1); border-color: #c84449; }
        .flip-card { perspective: 1000px; }
        .flip-card-inner { transition: transform 0.6s; transform-style: preserve-3d; }
        .flip-card-inner.flipped { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back { backface-visibility: hidden; }
        .flip-card-back { transform: rotateY(180deg); }
      `}</style>

      {loading ? (
        <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BrandColors.navy }} />
            <p className="text-slate-600">Loading lecture...</p>
          </div>
        </div>
      ) : error || !lecture ? (
        <div className="container mx-auto px-6 py-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-6" style={{ color: BrandColors.navy }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Lectures</span>
          </Link>
          <div className="rounded-lg p-6" style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #dc2626' }}>
            <p style={{ color: '#991b1b' }}>{error || 'Lecture not found'}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white min-h-screen">
          {/* HEADER */}
          <div className="border-b border-slate-200" style={{ backgroundColor: BrandColors['navy-light'] }}>
            <div className="container mx-auto px-6 py-12">
              <Link to="/" className="inline-flex items-center gap-2 mb-8" style={{ color: BrandColors.navy }}>
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Lectures</span>
              </Link>

              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex-1">
                  <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight" style={{ color: BrandColors.navy }}>
                    {lecture.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span>ID: {id}</span>
                    <span>•</span>
                    <span>{lecture.flashcards.length} flashcards</span>
                    <span>•</span>
                    <span>{lecture.quiz.length} quizzes</span>
                  </div>
                </div>
                <button
                  onClick={() => alert('Export functionality coming soon')}
                  className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-2xl hover:opacity-90 transition shadow-md hover:shadow-lg flex-shrink-0"
                  style={{ backgroundColor: BrandColors.coral }}
                >
                  <Download className="w-5 h-5" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="border-b border-slate-200 sticky top-0 z-40 bg-white">
            <div className="container mx-auto px-6">
              <div className="flex gap-8">
                <button
                  onClick={() => { setActiveTab('notes'); setFlipped(false); setShowResults(false); }}
                  className={`py-4 px-2 font-medium transition border-b-4 flex items-center gap-2 ${ activeTab === 'notes' ? 'tab-active' : 'border-transparent text-slate-600 hover:text-slate-900' }`}
                  style={{ borderBottomColor: activeTab === 'notes' ? BrandColors.coral : 'transparent', color: activeTab === 'notes' ? BrandColors.navy : undefined }}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Notes</span>
                </button>
                <button
                  onClick={() => { setActiveTab('flashcards'); setFlipped(false); setShowResults(false); }}
                  className={`py-4 px-2 font-medium transition border-b-4 flex items-center gap-2 ${ activeTab === 'flashcards' ? 'tab-active' : 'border-transparent text-slate-600 hover:text-slate-900' }`}
                  style={{ borderBottomColor: activeTab === 'flashcards' ? BrandColors.coral : 'transparent', color: activeTab === 'flashcards' ? BrandColors.navy : undefined }}
                >
                  <Zap className="w-5 h-5" />
                  <span>Flashcards</span>
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                    {lecture.flashcards.length}
                  </span>
                </button>
                <button
                  onClick={() => { setActiveTab('quiz'); setFlipped(false); }}
                  className={`py-4 px-2 font-medium transition border-b-4 flex items-center gap-2 ${ activeTab === 'quiz' ? 'tab-active' : 'border-transparent text-slate-600 hover:text-slate-900' }`}
                  style={{ borderBottomColor: activeTab === 'quiz' ? BrandColors.coral : 'transparent', color: activeTab === 'quiz' ? BrandColors.navy : undefined }}
                >
                  <CheckSquare className="w-5 h-5" />
                  <span>Quiz</span>
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                    {lecture.quiz.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="container mx-auto px-6 py-16">
            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="max-w-4xl">
                {!lecture.notes || lecture.notes.trim() === '' ? (
                  <div className="rounded-lg p-8 text-center" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ color: '#92400e' }} className="font-medium">📝 No notes available</p>
                    <p style={{ color: '#b45309' }} className="text-sm mt-1">Notes will appear once processing is complete</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {lecture.notes.split('\n').map((line, idx) => {
                      const trimmed = line.trim()
                      if (!trimmed) return <div key={idx} className="h-4" />
                      
                      if (trimmed.startsWith('## ')) {
                        const text = trimmed.replace('## ', '')
                        return (
                          <div
                            key={idx}
                            className="rounded-lg p-6 text-white shadow-md"
                            style={{ backgroundColor: BrandColors.navy }}
                          >
                            <h2 className="text-2xl font-bold">{text}</h2>
                          </div>
                        )
                      }
                      
                      if (trimmed.startsWith('- ')) {
                        const text = trimmed.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        return (
                          <div key={idx} className="flex gap-3 ml-4 mb-3">
                            <span className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: BrandColors.coral }} />
                            <p className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
                          </div>
                        )
                      }
                      
                      return (
                        <p key={idx} className="text-slate-700 leading-relaxed text-base border-l-4 pl-4" style={{ borderColor: BrandColors.coral + '30' }}>
                          {trimmed}
                        </p>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* FLASHCARDS TAB */}
            {activeTab === 'flashcards' && (
              <div className="max-w-2xl mx-auto">
                {lecture.flashcards.length > 0 ? (
                  <div className="space-y-8">
                    {/* Flashcard */}
                    <div className="flip-card" style={{ minHeight: '320px' }}>
                      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`} style={{ position: 'relative', minHeight: '320px' }}>
                        {/* Front */}
                        <div
                          onClick={() => setFlipped(!flipped)}
                          className="absolute inset-0 w-full rounded-2xl border-2 p-12 cursor-pointer flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition"
                          style={{ backgroundColor: '#ffffff', borderColor: BrandColors.coral + '30', backfaceVisibility: 'hidden' }}
                        >
                          <p className="text-sm text-slate-500 mb-8 font-medium">Click to reveal answer</p>
                          <div className="text-center">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-6 font-semibold" style={{ color: BrandColors.navy }}>Question</p>
                            <p className="text-2xl font-bold leading-relaxed" style={{ color: BrandColors.navy }}>
                              {lecture.flashcards[currentFlashcard].question}
                            </p>
                          </div>
                        </div>

                        {/* Back */}
                        <div
                          onClick={() => setFlipped(!flipped)}
                          className="absolute inset-0 w-full rounded-2xl border-2 p-12 cursor-pointer flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition"
                          style={{
                            backgroundColor: BrandColors['coral-light'],
                            borderColor: BrandColors.coral + '50',
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <p className="text-sm mb-8 font-medium" style={{ color: BrandColors.coral }}>Click to see question</p>
                          <div className="text-center">
                            <p className="text-xs uppercase tracking-widest mb-6 font-semibold" style={{ color: BrandColors.coral }}>Answer</p>
                            <p className="text-2xl font-bold leading-relaxed" style={{ color: BrandColors.navy }}>
                              {lecture.flashcards[currentFlashcard].answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress and Navigation */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-4">
                      <button
                        onClick={() => { setCurrentFlashcard(Math.max(0, currentFlashcard - 1)); setFlipped(false); }}
                        disabled={currentFlashcard === 0}
                        className="w-full sm:w-auto px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#f3f4f6', color: BrandColors.navy }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="flex flex-col items-center gap-3">
                        <span className="text-sm font-semibold text-slate-600">
                          {currentFlashcard + 1} of {lecture.flashcards.length}
                        </span>
                        <div className="flex gap-1.5">
                          {lecture.flashcards.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => { setCurrentFlashcard(i); setFlipped(false); }}
                              className="rounded-full transition"
                              style={{
                                width: i === currentFlashcard ? '32px' : '8px',
                                height: '8px',
                                backgroundColor: i === currentFlashcard ? BrandColors.coral : '#e5e7eb'
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => { setCurrentFlashcard(Math.min(lecture.flashcards.length - 1, currentFlashcard + 1)); setFlipped(false); }}
                        disabled={currentFlashcard === lecture.flashcards.length - 1}
                        className="w-full sm:w-auto px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#f3f4f6', color: BrandColors.navy }}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">No flashcards available</p>
                  </div>
                )}
              </div>
            )}

            {/* QUIZ TAB */}
            {activeTab === 'quiz' && (
              <div className="max-w-3xl">
                {lecture.quiz.length > 0 ? (
                  <>
                    {!showResults ? (
                      <div className="space-y-8">
                        {/* Progress Card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">Quiz Progress</h3>
                            <p className="text-sm text-slate-500 mt-1">
                              Answered: {Object.keys(quizAnswers).length} of {lecture.quiz.length}
                            </p>
                          </div>
                          {quizStarted && (
                            <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: BrandColors['navy-light'] }}>
                              <Clock className="w-5 h-5" style={{ color: BrandColors.navy }} />
                              <span className="font-semibold" style={{ color: BrandColors.navy }}>
                                {quizTime !== null ? `${Math.floor(quizTime / 60)}:${String(quizTime % 60).padStart(2, '0')}` : '0:00'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Questions */}
                        {lecture.quiz.map((q, idx) => (
                          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                            <div>
                              <p className="text-sm font-semibold mb-2" style={{ color: BrandColors.coral }}>
                                Question {idx + 1} of {lecture.quiz.length}
                              </p>
                              <h3 className="text-lg font-bold" style={{ color: BrandColors.navy }}>{q.question}</h3>
                            </div>

                            <div className="space-y-2">
                              {q.options.map((option, optIdx) => (
                                <label
                                  key={optIdx}
                                  className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition border-2"
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
                                      if (!quizStarted) setQuizStarted(true)
                                      setQuizAnswers({ ...quizAnswers, [idx]: Number(e.target.value) })
                                    }}
                                    className="w-4 h-4 flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <span className="font-semibold" style={{ color: BrandColors.navy }}>{optIdx}.</span>
                                    <span className="ml-2 text-slate-700">{option}</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6">
                          <button
                            onClick={() => {
                              setQuizAnswers({})
                              setShowResults(false)
                              setQuizStarted(false)
                              setQuizTime(null)
                            }}
                            className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium"
                            style={{ color: BrandColors.navy }}
                          >
                            Clear All
                          </button>
                          <button
                            onClick={() => setShowResults(true)}
                            disabled={Object.keys(quizAnswers).length < lecture.quiz.length}
                            className="flex-1 px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                            style={{ backgroundColor: quizAnswers[Object.keys(quizAnswers).length < lecture.quiz.length ? -1 : 0] ? BrandColors.coral : BrandColors.coral }}
                          >
                            Submit Quiz ({Object.keys(quizAnswers).length}/{lecture.quiz.length})
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Results Header */}
                        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
                          {(() => {
                            const correct = lecture.quiz.filter((q, idx) => quizAnswers[idx] === q.correct_answer).length
                            const percentage = Math.round((correct / lecture.quiz.length) * 100)
                            const minutes = Math.floor((quizTime || 0) / 60)
                            const seconds = (quizTime || 0) % 60

                            return (
                              <>
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4" style={{ backgroundColor: percentage >= 80 ? '#dcfce7' : percentage >= 60 ? '#fef3c7' : '#fee2e2' }}>
                                  <span className="text-4xl font-bold" style={{ color: percentage >= 80 ? '#166534' : percentage >= 60 ? '#92400e' : '#991b1b' }}>
                                    {percentage}%
                                  </span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2" style={{ color: BrandColors.navy }}>
                                  {percentage >= 80 ? '🎉 Great Job!' : percentage >= 60 ? '📚 Good effort!' : '💪 Keep practicing!'}
                                </h2>
                                <p className="text-slate-600 mb-6">
                                  You got <strong style={{ color: BrandColors.navy }}>{correct} out of {lecture.quiz.length}</strong> questions correct
                                </p>
                                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                                  <Clock className="w-4 h-4" />
                                  <span>Completed in {minutes}m {String(seconds).padStart(2, '0')}s</span>
                                </div>
                              </>
                            )
                          })()}
                        </div>

                        {/* Detailed Results */}
                        <div className="space-y-4">
                          {lecture.quiz.map((q, idx) => {
                            const isCorrect = quizAnswers[idx] === q.correct_answer
                            return (
                              <div
                                key={idx}
                                className="rounded-lg p-6 border-l-4"
                                style={{
                                  borderLeftColor: isCorrect ? '#16a34a' : '#dc2626',
                                  backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2'
                                }}
                              >
                                <div className="flex gap-4">
                                  <div
                                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{ backgroundColor: isCorrect ? '#16a34a' : '#dc2626' }}
                                  >
                                    {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold mb-2" style={{ color: isCorrect ? '#166534' : '#991b1b' }}>
                                      Question {idx + 1} {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                    </p>
                                    <p className="font-medium mb-3" style={{ color: BrandColors.navy }}>{q.question}</p>

                                    <div className="bg-white rounded p-3 space-y-2 text-sm">
                                      <div>
                                        <p className="text-slate-600">
                                          <span className="font-semibold">Your answer:</span> {quizAnswers[idx]}. {q.options[quizAnswers[idx]]}
                                        </p>
                                      </div>
                                      {!isCorrect && (
                                        <div className="pt-2 border-t border-slate-200">
                                          <p className="text-slate-600">
                                            <span className="font-semibold" style={{ color: '#16a34a' }}>Correct answer:</span>
                                            <span className="ml-1 font-medium" style={{ color: '#16a34a' }}>
                                              {q.correct_answer}. {q.options[q.correct_answer]}
                                            </span>
                                          </p>
                                        </div>
                                      )}
                                      {q.explanation && (
                                        <div className="pt-2 border-t border-slate-200">
                                          <p className="text-slate-600">
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
                            setShowResults(false)
                            setQuizStarted(false)
                            setQuizTime(null)
                          }}
                          className="w-full px-6 py-3 text-white rounded-lg hover:opacity-90 transition font-medium"
                          style={{ backgroundColor: BrandColors.navy }}
                        >
                          Retake Quiz
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">No quiz questions available</p>
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
