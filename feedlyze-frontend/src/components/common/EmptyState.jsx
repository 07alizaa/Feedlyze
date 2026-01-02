// src/components/common/EmptyState.jsx
import { cn } from '../../utils/helpers';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = '',
}) => {
  return (
    <div className={cn('text-center py-12', className)}>
      {Icon && (
        <div className="mx-auto w-16 h-16 bg-light-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-dark-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-dark-900 mb-2">{title}</h3>
      {description && (
        <p className="text-dark-500 max-w-sm mx-auto mb-6">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
