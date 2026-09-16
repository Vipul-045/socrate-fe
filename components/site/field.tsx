import * as React from "react";
import { cn } from "@/lib/utils";

const controlClasses =
  "w-full rounded-lg border border-line-control bg-card px-4 py-3.5 text-body text-ink transition-colors duration-200 hover:border-ink/45 focus:border-ink focus:outline-none focus-visible:outline-none disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-small font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-small text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-small text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(controlClasses, className)} {...props} />
));
TextInput.displayName = "TextInput";

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlClasses, "min-h-[11rem] resize-y", className)}
    {...props}
  />
));
TextArea.displayName = "TextArea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      controlClasses,
      "cursor-pointer appearance-none bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-11",
      className,
    )}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9' fill='none'%3E%3Cpath d='M1 1l6 6 6-6' stroke='%236D675F' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    }}
    {...props}
  />
));
Select.displayName = "Select";
