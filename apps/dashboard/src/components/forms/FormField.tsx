import { cn } from "@/lib/utils";

export function FormField({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      <span className={cn("min-h-5 text-sm text-destructive", !error && "invisible")}>{error ?? "No error"}</span>
    </div>
  );
}
