"use client";

import { useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

type ComboboxFilterProps = {
  id: string;
  urlParam: string;
  label: string;
  icon: React.ReactNode;
  options: Array<{ name: string }>;
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get display value for the select
  const displayValue =
    value === "all" ? `All ${label}s` : value || `All ${label}s`;

  // Handle select change
  const handleSelect = useCallback(
    (selectedValue: string) => {
      setOpen(false);

      // Don't update if value hasn't changed
      if (selectedValue === value) return;

      // Create new search params
      const params = new URLSearchParams(searchParams.toString());

      // Update or remove the parameter
      if (selectedValue === "all") {
        params.delete(urlParam);
      } else {
        params.set(urlParam, selectedValue);
      }

      // Reset to page 1 when filters change
      params.set("page", "1");

      // Update URL without full page reload
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [value, urlParam, pathname, router, searchParams]
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
            "w-full justify-between bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all",
            isActive && "ring-1 ring-blue-200 dark:ring-blue-900",
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
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0"
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
          <CommandGroup className="max-h-[300px] overflow-auto">
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
                key={option.name}
                value={option.name}
                onSelect={() => handleSelect(option.name)}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.name ? "opacity-100" : "opacity-0"
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