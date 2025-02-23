import * as React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  size?: "small" | "medium";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export const Button: React.FC<ButtonProps> = ({ children, variant = "primary", size = "medium", onClick, className = "", disabled = false, type = "button" }) => {
  const baseStyles = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = {
    primary: "bg-figma-secondaryBg hover:bg-figma-secondaryBg-hover text-figma-primary",
    outline: "ring-1 ring-figma-border hover:bg-figma-secondaryBg text-figma-primary",
  };
  const sizeStyles = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-2 text-sm",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </button>
  );
};
