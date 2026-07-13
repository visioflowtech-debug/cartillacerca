import type { ButtonHTMLAttributes } from 'react';

interface BigTouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function BigTouchButton({
  variant = 'primary',
  className = '',
  ...props
}: BigTouchButtonProps) {
  return <button className={`big-touch-button big-touch-button--${variant} ${className}`} {...props} />;
}
