import { router } from "@inertiajs/react";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ComboboxOption = {
  id: number;
  name: string;
};

type ComboboxFilterProps = {
  id: string;
  urlParam: string;
  label: string;
  icon: React.ReactNode;
  options: ComboboxOption[];
  value: string;
  className?: string;
  isActive?: boolean;
};

export function ComboboxFilter({
  urlParam,
  label,
  icon,
  options,
  value,
  className,
  isActive,
}: ComboboxFilterProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get display value for the select
  const selectedOption =
    value !== "all"
      ? options.find((option) => String(option.id) === value)
      : undefined;

  const displayValue = selectedOption?.name ?? `All ${label}s`;

  // Handle select change
  const handleSelect = useCallback(
    (selectedValue: string) => {
      setOpen(false);

      // Don't update if value hasn't changed
      if (selectedValue === value) return;

      // Create new search params from current URL
      const url = new URL(window.location.href);
      const params = url.searchParams;

      // Update or remove the parameter
      if (selectedValue === "all") {
        params.delete(urlParam);
      } else {
        params.set(urlParam, selectedValue);
      }

      // Reset to page 1 when filters change
      params.set("page", "1");

      // Update URL without full page reload using Inertia
      router.visit(url.toString(), { 
        preserveState: true, 
        preserveScroll: false,
        replace: true 
      });
    },
    [value, urlParam]
  );

  // Handle manual focus to avoid auto-focusing on mobile
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between transition-all",
            isActive && "ring-1 ring-ring",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {icon}
            <span className="truncate text-left">{displayValue}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-60 p-0"
        align="start"
        sideOffset={4}
      >
        <Command className="w-full">
          <CommandInput
            ref={inputRef}
            placeholder={`Search ${label}...`}
            autoFocus={false}
          />
          <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
          <CommandGroup className="max-h-75 overflow-auto">
            <CommandItem
              key="all"
              value="all"
              onSelect={() => handleSelect("all")}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "all" ? "opacity-100" : "opacity-0"
                )}
              />
              All {label}s
            </CommandItem>
            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={String(option.id)}
                keywords={[option.name]}
                onSelect={() => handleSelect(String(option.id))}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === String(option.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}