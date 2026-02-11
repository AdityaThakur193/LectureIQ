export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-16 sm:mt-20 md:mt-24 border-t border-brand-navy">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-14 md:py-16">
        {/* Main footer content - Stack on mobile, grid on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-16 mb-12 sm:mb-14 md:mb-16">
          {/* Brand - Full width on mobile, 2 cols on large screens */}
          <div className="lg:col-span-2">
            <img src="/logo.png" alt="LectureIQ" className="h-9 sm:h-10 w-auto mb-4 sm:mb-6" />
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-sm">
              Learning shouldn't feel like work. LectureIQ turns your lecture recordings into actual study materials—in minutes, not hours.
            </p>
            {/* Social Links - Min 44px tap target */}
            <div className="flex gap-6 sm:gap-8 mt-6 sm:mt-8">
              <a 
                href="https://github.com/AdityaThakur193" 
                target="_blank" 
                rel="noreferrer" 
                className="text-slate-400 hover:text-brand-emerald transition-colors text-sm font-medium inline-flex items-center min-h-[44px] min-w-[44px] justify-center sm:justify-start"
              >
                GitHub
              </a>
              <a 
                href="https://www.linkedin.com/in/aditya-thakur193" 
                target="_blank" 
                rel="noreferrer" 
                className="text-slate-400 hover:text-brand-emerald transition-colors text-sm font-medium inline-flex items-center min-h-[44px] min-w-[44px] justify-center sm:justify-start"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Product - Better spacing on mobile */}
          <div>
            <h4 className="font-semibold text-white mb-4 sm:mb-6 text-sm uppercase tracking-wide opacity-80">Product</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-sm">
              <li>
                <a 
                  href="/features" 
                  className="text-slate-400 hover:text-brand-emerald transition-colors inline-flex items-center min-h-[44px]"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="/docs" 
                  className="text-slate-400 hover:text-brand-emerald transition-colors inline-flex items-center min-h-[44px]"
                >
                  Docs
                </a>
              </li>
              <li>
                <a 
                  href="/my-lectures" 
                  className="text-slate-400 hover:text-brand-emerald transition-colors inline-flex items-center min-h-[44px]"
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Legal - Better spacing on mobile */}
          <div>
            <h4 className="font-semibold text-white mb-4 sm:mb-6 text-sm uppercase tracking-wide opacity-80">Legal</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-sm">
              <li>
                <a 
                  href="/privacy" 
                  className="text-slate-400 hover:text-brand-emerald transition-colors inline-flex items-center min-h-[44px]"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-slate-400 hover:text-brand-emerald transition-colors inline-flex items-center min-h-[44px]"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom - Stack on mobile */}
        <div className="border-t border-slate-700 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 sm:gap-8">
            <p className="text-slate-500 text-xs sm:text-sm">
              © 2026 LectureIQ. Learning, reimagined.
            </p>
            <p className="text-slate-600 text-[10px] sm:text-xs max-w-md">
              Built by students, for students. No corporate bloat. Just tools that actually help you learn smarter.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
