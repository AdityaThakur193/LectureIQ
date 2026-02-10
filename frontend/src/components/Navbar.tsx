import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    const uploadSection = document.getElementById('upload-form')
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <style>{`
        .text-brand-navy { color: #362c5d; }
        .text-brand-coral { color: #c84449; }
        .bg-brand-coral { background-color: #c84449; }
      `}</style>
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-md rounded-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex  items-center gap-2.5 hover:opacity-80 transition">
              <img src="/logo.png" alt="LectureIQ" className="h-14 w-auto" />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-12">
              <div className="hidden md:flex items-center gap-10">
                <Link to="/my-lectures" className="text-sm font-medium text-slate-600 hover:text-brand-navy transition flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  My Lectures
                </Link>
                <Link to="/features" className="text-sm font-medium text-slate-600 hover:text-brand-navy transition">Features</Link>
                <Link to="/docs" className="text-sm font-medium text-slate-600 hover:text-brand-navy transition">Docs</Link>
              </div>
              
              <button 
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-coral text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                style={{backgroundColor: '#c84449'}}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
