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
      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/40 select-none disabled:cursor-not-allowed disabled:opacity-40 p-0.5 ${
        isChecked
          ? 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/30'
          : 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600'
      } ${className || ''}`}
      {...props}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
          isChecked ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
    </button>
  );
});
Switch.displayName = "Switch";

export { Switch };
