import { forwardRef } from 'react';

const Checkbox = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex items-center">
      <input
        ref={ref}
        type="checkbox"
        className={`w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 ${className}`}
        {...props}
      />
      {label && (
        <label className="ml-3 text-sm text-slate-700 cursor-pointer">
          {label}
        </label>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
