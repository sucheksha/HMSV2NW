import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  iconLabel: string;
  rotateOnHover?: boolean;
}

export function IconButton({
  children,
  iconLabel,
  rotateOnHover = false,
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={iconLabel}
      title={props.title ?? iconLabel}
      className={`
        inline-flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        text-muted-foreground
        transition-all
        duration-200
        ease-out
        hover:bg-muted
        hover:text-foreground
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
        focus-visible:ring-offset-2
        ${rotateOnHover ? "hover:rotate-90" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
export type { IconButtonProps };
