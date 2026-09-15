import { initials } from "~/lib/names";
import { cn } from "~/lib/utils";

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
};

export function ContributorAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof SIZES;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary",
        SIZES[size],
      )}
    >
      {initials(name)}
    </span>
  );
}
