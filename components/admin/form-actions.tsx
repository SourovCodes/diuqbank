"use client";

import { useRouter } from "nextjs-toploader/app";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  backHref: string;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function FormActions({
  backHref,
  isLoading,
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: FormActionsProps) {
  const router = useRouter();
  return (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push(backHref)}
        disabled={!!isLoading}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={!!isLoading}>
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}
