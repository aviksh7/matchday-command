import React from 'react';
import Icon, { type IconName } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'paper' | 'ghost';
  icon?: IconName;
  trailingIcon?: IconName;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  trailingIcon,
  className = '',
  children,
  ...props
}) => (
  <button className={`mc-button mc-button--${variant} ${className}`.trim()} {...props}>
    {icon && <Icon name={icon} size={17} />}
    <span>{children}</span>
    {trailingIcon && <Icon name={trailingIcon} size={17} />}
  </button>
);

export default Button;
