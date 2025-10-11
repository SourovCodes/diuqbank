import { router } from "@inertiajs/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ClearFiltersButtonProps = {
  count: number;
};

export function ClearFiltersButton({ count }: ClearFiltersButtonProps) {
  const handleClearFilters = () => {
    // Get the current URL without query parameters
    const url = new URL(window.location.href);
    url.search = "";

    // Navigate to the clean URL
    router.visit(url.toString(), {
      preserveState: false,
      preserveScroll: false,
      replace: true,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearFilters}
      className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"
    >
      <X className="h-3.5 w-3.5 mr-1" />
      Clear {count > 1 ? `all (${count})` : "filter"}
    </Button>
  );
}
