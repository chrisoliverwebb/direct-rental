import { Button } from "@/components/ui/button";

type TabOption<T extends string> = {
  value: T;
  label: string;
};

type TabSelectorProps<T extends string> = {
  options: ReadonlyArray<TabOption<T>>;
  value: T;
  onChange: (value: T) => void;
};

export function TabSelector<T extends string>({ options, value, onChange }: TabSelectorProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? "default" : "outline"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
