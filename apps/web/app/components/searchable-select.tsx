import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import type { SelectOption } from "~/lib/filters";
import { cn } from "~/lib/utils";

type SearchableSelectProps = {
  label: string;
  /** Shown when nothing is selected, and as the "clear" option. */
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Offer the placeholder as an item that clears the selection. Defaults to true. */
  clearable?: boolean;
  /** Overrides the trigger text, e.g. for a new value that isn't one of the options. */
  displayLabel?: string;
  /** When set, typing a name that matches no option offers to add it. */
  onCreate?: (name: string) => void;
  createLabel?: (name: string) => string;
  invalid?: boolean;
};

const CLEAR_VALUE = "__all__";
const CREATE_VALUE = "__create__";

// Match on the visible label (passed as keywords), not the option id.
const filterByLabel = (_value: string, search: string, keywords?: string[]) =>
  keywords?.some((k) => k.toLowerCase().includes(search.toLowerCase())) ? 1 : 0;

export function SearchableSelect({
  label,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  value,
  onChange,
  clearable = true,
  displayLabel,
  onCreate,
  createLabel,
  invalid,
}: SearchableSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((option) => option.value === value);
  const triggerLabel = displayLabel ?? selected?.label;

  const name = search.trim();
  const canCreate =
    onCreate !== undefined &&
    name.length >= 2 &&
    !options.some((o) => o.label.toLowerCase() === name.toLowerCase());

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  const select = (next: string | null) => {
    onChange(next);
    changeOpen(false);
  };

  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={changeOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid || undefined}
            className="w-full min-w-0 justify-between font-normal"
          >
            <span
              className={cn(
                "min-w-0 truncate",
                !triggerLabel && "text-muted-foreground",
              )}
            >
              {triggerLabel ?? placeholder}
            </span>
            <ChevronsUpDown className="opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) min-w-64 p-0"
        >
          <Command filter={filterByLabel}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {clearable && (
                  <CommandItem
                    value={CLEAR_VALUE}
                    keywords={[placeholder]}
                    onSelect={() => select(null)}
                  >
                    <Check
                      className={cn(triggerLabel ? "opacity-0" : "opacity-100")}
                      aria-hidden
                    />
                    {placeholder}
                  </CommandItem>
                )}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    onSelect={() => select(option.value)}
                  >
                    <Check
                      className={cn(
                        option.value === value ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden
                    />
                    {option.label}
                  </CommandItem>
                ))}
                {canCreate && (
                  <CommandItem
                    value={CREATE_VALUE}
                    keywords={[name]}
                    onSelect={() => {
                      onCreate(name);
                      changeOpen(false);
                    }}
                  >
                    <Plus aria-hidden />
                    {createLabel ? createLabel(name) : `Add “${name}”`}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
