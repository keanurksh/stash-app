import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-32 cursor-pointer overflow-hidden rounded-full border bg-background p-2 text-center font-semibold",
        className,
      )}
      {...props}
    >
      <span className="inline-block transition-all duration-300 group-hover:-translate-y-12 group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute inset-0 z-10 flex h-full w-full translate-y-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <span>{text}</span>
        <ArrowRight className="size-4 shrink-0" />
      </div>
      <div className="absolute inset-0 rounded-full bg-primary opacity-0 transition-all duration-300 group-hover:opacity-100"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
