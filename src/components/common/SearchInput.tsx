import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { IconButton } from "@/components/common/IconButton";
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
        <IconButton
          iconLabel="Clear search"
          rotateOnHover
          onClick={handleClear}
          className="
      absolute right-1 top-1/2
      -translate-y-1/2
      hover:bg-muted
    "
        >
          <X className="h-4 w-4" />
        </IconButton>
      )}
    </div>
  );
}

export type { SearchInputProps };
