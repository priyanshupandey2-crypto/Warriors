import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: keyof typeof LucideIcons;
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
  color,
  strokeWidth = 2,
}) => {
  const IconComponent = LucideIcons[name] as React.ComponentType<any>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
};

export default Icon;
