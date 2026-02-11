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
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - Responsive sizing */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0">
            <img src="/logo.png" alt="LectureIQ" className="h-10 sm:h-12 w-auto" />
          </Link>

          {/* Navigation Links - Hide some on mobile */}
          <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link 
                to="/my-lectures" 
                className="text-sm font-medium text-slate-600 hover:text-brand-navy transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                My Lectures
              </Link>
              <Link 
                to="/features" 
                className="text-sm font-medium text-slate-600 hover:text-brand-navy transition-colors duration-150 whitespace-nowrap"
              >
                Features
              </Link>
              <Link 
                to="/docs" 
                className="text-sm font-medium text-slate-600 hover:text-brand-navy transition-colors duration-150 whitespace-nowrap"
              >
                Docs
              </Link>
            </div>
            
            {/* Get Started Button - Mobile optimized with 44px min height */}
            <button 
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 min-h-[44px] bg-brand-navy text-white text-xs sm:text-sm font-semibold rounded transition-all duration-200 hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              <span className="hidden xs:inline">Get Started</span>
              <span className="xs:hidden">Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
