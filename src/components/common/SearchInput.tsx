import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { Input } from "@/components/ui/input";

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  containerClassName = "",
  className = "",
  placeholder = "Search...",
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }

    onChange("");
  };

  return (
    <div className={`relative w-full ${containerClassName}`}>
      <Search
        className="
          pointer-events-none
          absolute left-3 top-1/2
          h-4 w-4
          -translate-y-1/2
          text-muted-foreground
        "
        aria-hidden="true"
      />

      <Input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`pl-9 pr-9 ${className}`}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="
            absolute right-2 top-1/2
            flex h-7 w-7
            -translate-y-1/2
            items-center justify-center
            rounded-md
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary
          "
          aria-label="Clear search"
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export type { SearchInputProps };
