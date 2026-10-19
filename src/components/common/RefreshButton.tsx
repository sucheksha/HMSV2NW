import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type RefreshButtonProps = {
  onRefresh: () => void;
  loading?: boolean;
};

export function RefreshButton({ onRefresh, loading = false }: RefreshButtonProps) {
  return (
    <Button type="button" variant="outline" onClick={onRefresh} disabled={loading}>
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}
