import React from 'react';

const Switch = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  const isChecked = Boolean(checked);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && onCheckedChange) {
          onCheckedChange(!isChecked);
        }
      }}
      ref={ref}
      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-1 select-none disabled:cursor-not-allowed disabled:opacity-40 ${
        isChecked
          ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
          : 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600 hover:bg-slate-400 dark:hover:bg-slate-600'
      } ${className || ''}`}
      {...props}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
          isChecked ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
});
Switch.displayName = "Switch";

export { Switch };
