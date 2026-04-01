import { memo, type ButtonHTMLAttributes, type ComponentType } from 'react'

type Variant = 'ghost' | 'accent' | 'muted'
type Size = 'sm' | 'md'

const variantStyles: Record<Variant, string> = {
  ghost: 'text-text-muted hover:bg-item-hover hover:text-text-secondary',
  accent: 'text-accent hover:bg-accent-soft',
  muted: 'text-text-muted hover:bg-item-hover hover:text-text'
}

const sizeStyles: Record<Size, { button: string; icon: string }> = {
  sm: { button: 'px-2 py-1 text-[11px] gap-1.5', icon: 'w-3.5 h-3.5' },
  md: { button: 'px-3 py-1.5 text-[12px] gap-2', icon: 'w-4 h-4' }
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ComponentType<{ className?: string }>
  variant?: Variant
  size?: Size
}

const Button = memo(function Button({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const s = sizeStyles[size]
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`inline-flex items-center shrink-0 rounded-lg font-sans transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent ${s.button} ${variantStyles[variant]} ${disabled ? 'opacity-30 pointer-events-none' : ''} ${className}`}
    >
      {Icon && <Icon className={s.icon} />}
      {children && <span>{children}</span>}
    </button>
  )
})

export default Button
