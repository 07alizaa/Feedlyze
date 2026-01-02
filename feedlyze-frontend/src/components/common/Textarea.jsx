// src/components/common/Textarea.jsx
import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Textarea = forwardRef(({
  label,
  error,
  rows = 4,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={cn('space-y-1', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-dark-700">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'block w-full rounded-lg border transition-colors duration-200 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'placeholder:text-dark-400',
          'px-4 py-2.5',
          error
            ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
            : 'border-light-200 hover:border-light-300',
          'disabled:bg-light-100 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
