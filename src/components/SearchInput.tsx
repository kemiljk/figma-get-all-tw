import * as React from "react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { BookmarkIcon } from "@radix-ui/react-icons";

export type SearchInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSuggestionSelect?: (suggestion: any) => void;
  suggestions?: Array<{ id: string; label: string; description?: string }>;
};

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder, className = "", icon: Icon = MagnifyingGlassIcon, onSuggestionSelect, suggestions = [] }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Always highlight first item if there are suggestions
  React.useEffect(() => {
    if (suggestions.length > 0) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(-1);
    }
  }, [suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // For search name input (identified by BookmarkIcon)
      if (Icon === BookmarkIcon && value.trim()) {
        // Simulate button click for saving
        const button = inputRef.current?.closest("div.flex")?.querySelector("button");
        button?.click();
        return;
      }
      // For search suggestions
      if (suggestions.length > 0) {
        onSuggestionSelect?.(suggestions[selectedIndex >= 0 ? selectedIndex : 0]);
        setSelectedIndex(-1);
      }
      return;
    }

    if (!suggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Escape":
        e.preventDefault();
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative w-full">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-figma-secondary" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`h-9 w-full rounded-md bg-figma-secondaryBg pl-9 pr-3 text-sm text-figma-primary placeholder:text-figma-secondary outline-none ${className}`}
        role="combobox"
        aria-expanded={suggestions.length > 0}
        aria-controls="search-suggestions"
        aria-activedescendant={selectedIndex >= 0 && suggestions.length > 0 ? `suggestion-${suggestions[selectedIndex]?.id}` : undefined}
      />
      {suggestions.length > 0 && (
        <div id="search-suggestions" className="absolute left-0 right-0 top-full mt-1 rounded-md border border-figma-border bg-white shadow-lg" role="listbox">
          {suggestions.map((suggestion, index) => (
            <div key={suggestion.id} id={`suggestion-${suggestion.id}`} role="option" aria-selected={index === selectedIndex} className={`cursor-pointer px-4 py-2 text-left ${index === selectedIndex ? "bg-figma-secondaryBg-hover text-figma-primary font-medium" : "hover:bg-figma-secondaryBg/50"} transition-colors`} onClick={() => onSuggestionSelect?.(suggestion)}>
              <div className="font-medium text-sm">{suggestion.label}</div>
              {suggestion.description && <div className="text-xs text-figma-secondary mt-0.5">{suggestion.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
