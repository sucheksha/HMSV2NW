import { Checkbox } from "@/components/ui/checkbox";

type DataTableSelectionProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel?: string;
};

export function DataTableSelection({
  checked,
  onCheckedChange,
  ariaLabel = "Select row",
}: DataTableSelectionProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      aria-label={ariaLabel}
    />
  );
}
