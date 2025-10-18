import React from 'react';
import clsx from 'clsx';

const Card = ({
  children,
  className,
  padding = 'medium',
  shadow = 'sm',
  hover = false,
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';

  return (
    <div
      className={clsx(
        'card',
        paddingClasses[padding],
        shadowClasses[shadow],
        hoverClasses,
        {
          'cursor-pointer': onClick,
        },
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => (
  <div className={clsx('border-b border-gray-200 pb-3 mb-4', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3 className={clsx('text-lg font-semibold text-gray-900', className)} {...props}>
    {children}
  </h3>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={clsx('text-gray-600', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div className={clsx('border-t border-gray-200 pt-3 mt-4', className)} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
