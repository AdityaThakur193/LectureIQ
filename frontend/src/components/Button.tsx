import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded transition-all duration-200 inline-flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'bg-brand-navy text-white hover:bg-opacity-90 active:scale-95 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md',
    secondary: 'border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white active:scale-95 disabled:border-slate-300 disabled:text-slate-400',
    minimal: 'text-brand-navy hover:bg-brand-emerald hover:text-white disabled:text-slate-400 active:scale-95 transition-colors duration-150',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
