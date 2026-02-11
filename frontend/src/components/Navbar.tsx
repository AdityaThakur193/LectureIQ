import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleGetStarted = () => {
    const uploadSection = document.getElementById('upload-form')
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' })
      return
    }

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: 'upload' } })
      return
    }

    navigate('/', { state: { scrollTo: 'upload' } })
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="LectureIQ" className="h-12 w-auto" />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/my-lectures" 
                className="text-sm font-medium text-slate-600 hover:text-brand-navy transition-colors duration-150 flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                My Lectures
              </Link>
              <Link 
                to="/features" 
                className="text-sm font-medium text-slate-600 hover:text-brand-navy transition-colors duration-150"
              >
                Features
              </Link>
              <Link 
                to="/docs" 
                className="text-sm font-medium text-slate-600 hover:text-brand-navy transition-colors duration-150"
              >
                Docs
              </Link>
            </div>
            
            <button 
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded transition-all duration-200 hover:shadow-md active:scale-95"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
