import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DataTablePageSizeProps = {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
};

export function DataTablePageSize({
  value,
  onChange,
  options = [10, 25, 50, 100],
}: DataTablePageSizeProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Rows per page:</span>

      <Select value={String(value)} onValueChange={(newValue) => onChange(Number(newValue))}>
        <SelectTrigger className="w-[80px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
