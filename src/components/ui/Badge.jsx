import React from 'react';

const Badge = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2";
  
  const variants = {
    default: "bg-emerald-500 text-white hover:bg-emerald-600",
    secondary: "bg-surface text-white border border-white/10 hover:bg-surface-hover",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "text-gray-300 border border-white/10",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div
      ref={ref}
      className={`${baseStyles} ${currentVariant} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});
Badge.displayName = "Badge";

export { Badge };
