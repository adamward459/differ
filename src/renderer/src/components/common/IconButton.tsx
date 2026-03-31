import { memo, type ButtonHTMLAttributes, type ComponentType } from "react";

type Variant = "ghost" | "accent" | "muted";
type Size = "sm" | "md";

const variantStyles: Record<Variant, string> = {
  ghost: "text-text-muted hover:bg-item-hover hover:text-text-secondary",
  accent: "text-accent hover:bg-accent-soft",
  muted: "text-text-muted hover:bg-item-hover hover:text-text",
};

const sizeStyles: Record<Size, { button: string; icon: string }> = {
  sm: { button: "p-1.5", icon: "w-3.5 h-3.5" },
  md: { button: "p-2", icon: "w-4 h-4" },
};

interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  icon: ComponentType<{ className?: string }>;
  variant?: Variant;
  size?: Size;
}

const IconButton = memo(function IconButton({
  icon: Icon,
  variant = "ghost",
  size = "md",
  className = "",
  disabled,
  ...rest
}: IconButtonProps) {
  const s = sizeStyles[size];
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`shrink-0 rounded-lg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent ${s.button} ${variantStyles[variant]} ${disabled ? "opacity-30 pointer-events-none" : ""} ${className}`}
    >
      <Icon className={s.icon} />
    </button>
  );
});

export default IconButton;
