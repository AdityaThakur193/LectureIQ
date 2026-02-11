interface CardProps {
  title?: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'outlined' | 'elevated'
}

export default function Card({
  title,
  description,
  children,
  footer,
  onClick,
  className = '',
  variant = 'default',
}: CardProps) {
  const baseStyles = 'rounded transition-all duration-200'
  
  const variants = {
    default: 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md',
    outlined: 'bg-transparent border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white hover:shadow-lg',
    elevated: 'bg-slate-50 border border-slate-200 shadow-sm hover:shadow-lg hover:bg-white hover:border-brand-emerald/50',
  }

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
      onClick={onClick}
    >
      {(title || description) && (
        <div className="px-6 py-4 border-b border-slate-200">
          {title && (
            <h3 className="font-semibold text-slate-900 text-brand-navy">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>
      )}

      {children && <div className="px-6 py-4">{children}</div>}

      {footer && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b">
          {footer}
        </div>
      )}
    </div>
  )
}
