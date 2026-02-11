export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-24 border-t border-brand-navy">
      <div className="container mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          {/* Brand - Large column */}
          <div className="lg:col-span-2">
            <img src="/logo.png" alt="LectureIQ" className="h-10 w-auto mb-6" />
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Learning shouldn't feel like work. LectureIQ turns your lecture recordings into actual study materials—in minutes, not hours.
            </p>
            <div className="flex gap-6 mt-8">
              <a href="https://github.com/AdityaThakur193" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-emerald transition-colors text-sm font-medium">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/aditya-thakur193" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-emerald transition-colors text-sm font-medium">
                LinkedIn
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-sm uppercase tracking-wide opacity-80">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/features" className="text-slate-400 hover:text-brand-emerald transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/docs" className="text-slate-400 hover:text-brand-emerald transition-colors">
                  Docs
                </a>
              </li>
              <li>
                <a href="/my-lectures" className="text-slate-400 hover:text-brand-emerald transition-colors">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-sm uppercase tracking-wide opacity-80">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/privacy" className="text-slate-400 hover:text-brand-emerald transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-slate-400 hover:text-brand-emerald transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom - unique layout, not centered */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <p className="text-slate-500 text-sm">
              © 2026 LectureIQ. Learning, reimagined.
            </p>
            <p className="text-slate-600 text-xs max-w-md">
              Built by students, for students. No corporate bloat. Just tools that actually help you learn smarter.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
