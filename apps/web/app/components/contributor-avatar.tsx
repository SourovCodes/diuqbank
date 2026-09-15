import { useState } from "react";
import { initials } from "~/lib/names";
import { cn } from "~/lib/utils";

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
};

/** A user's profile image, or their initials when they have none (or it fails to load). */
export function ContributorAvatar({
  name,
  image,
  size = "md",
}: {
  name: string;
  image?: string | null;
  size?: keyof typeof SIZES;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const className = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-medium text-primary",
    SIZES[size],
  );

  if (image && image !== failedImage) {
    return (
      <img
        src={image}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        onError={() => setFailedImage(image)}
        className={cn(className, "object-cover")}
      />
    );
  }
  return (
    <span aria-hidden className={className}>
      {initials(name)}
    </span>
  );
}
