import { cn } from "@/lib/utils";
import logoAsset from "@/assets/jeevix-logo.png.asset.json";

/**
 * Official JEEVIX brand mark.
 * The uploaded logo already contains the "JEEVIX" wordmark and the
 * "Smart Operations. Better Care." tagline, so this component simply
 * renders the image at the requested size while preserving aspect ratio.
 */
export function JeevixLogo({
  className,
  variant = "dark",
  size = "md",
}: {
  className?: string;
  /** `light` inverts for dark backgrounds via CSS filters. */
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const height =
    size === "xl"
      ? "h-24 sm:h-28"
      : size === "lg"
        ? "h-16 sm:h-20"
        : size === "sm"
          ? "h-8"
          : "h-11";

  return (
    <img
      src={logoAsset.url}
      alt="JEEVIX — Smart Operations. Better Care."
      className={cn(
        "w-auto select-none object-contain",
        height,
        // On the dark navy panel, brighten the logo so the deep-navy strokes
        // of the wordmark remain legible without altering the brand hues.
        variant === "light" && "brightness-0 invert",
        className,
      )}
      draggable={false}
    />
  );
}
