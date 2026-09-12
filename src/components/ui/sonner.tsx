import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      className="toaster group"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:w-[420px] group-[.toaster]:max-w-[calc(100vw-32px)] group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:bg-background group-[.toaster]:p-5 group-[.toaster]:text-foreground group-[.toaster]:shadow-xl",

          title: "group-[.toast]:text-base group-[.toast]:font-semibold group-[.toast]:leading-6",

          description:
            "group-[.toast]:mt-1 group-[.toast]:text-sm group-[.toast]:leading-5 group-[.toast]:text-muted-foreground",

          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",

          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
