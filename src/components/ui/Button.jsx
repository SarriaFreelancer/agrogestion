import React from 'react';

const Button = React.forwardRef(({ className, variant = 'primary', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-primary text-[var(--text-contrast)] hover:bg-primary-dark shadow-md",
    secondary: "bg-surface text-[var(--text-contrast)] hover:bg-white/10 border border-white/10",
    outline: "border border-primary/50 text-primary hover:bg-primary/10",
    ghost: "hover:bg-white/10 hover:text-[var(--text-contrast)] text-[var(--text-muted)]",
    danger: "bg-red-500 text-[var(--text-contrast)] hover:bg-red-600 shadow-md",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes.default; // Simplificado por ahora

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${currentVariant} ${currentSize} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button };
