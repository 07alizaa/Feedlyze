// src/components/common/Card.jsx
import { cn } from '../../utils/helpers';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-card border border-light-200',
        hover && 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={cn('text-lg font-semibold text-dark-900', className)}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={cn('text-sm text-dark-500 mt-1', className)}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={cn('mt-4 pt-4 border-t border-light-200 flex items-center gap-2', className)}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
