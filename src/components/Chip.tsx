import * as React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";

type ChipProps = {
  label: string;
  onRemove?: () => void;
  className?: string;
};

export const Chip: React.FC<ChipProps> = ({ label, onRemove, className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-figma-secondaryBg text-sm text-figma-primary rounded-full ${className}`}>
      <span>{label}</span>
      {onRemove && (
        <button onClick={onRemove} className="p-0.5 rounded-full hover:bg-figma-secondaryBg-hover text-figma-secondary hover:text-figma-primary transition-colors">
          <Cross2Icon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
