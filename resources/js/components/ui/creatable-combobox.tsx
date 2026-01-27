"use client";

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
    value: string;
    label: string;
}

interface CreatableComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    onCreateNew?: (name: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    createLabel?: string;
    disabled?: boolean;
    className?: string;
    allowCreate?: boolean;
}

export function CreatableCombobox({
    options,
    value,
    onChange,
    onCreateNew,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyMessage = "No option found.",
    createLabel = "Create",
    disabled = false,
    className,
    allowCreate = false,
}: CreatableComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const selectedOption = options.find(
        (option) => option.value === value
    );

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
    );

    const showCreateOption =
        allowCreate &&
        search.length > 0 &&
        !options.some(
            (option) =>
                option.label.toLowerCase() === search.toLowerCase()
        );

    const handleCreate = () => {
        if (onCreateNew && search.trim()) {
            onCreateNew(search.trim());
            setSearch("");
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {showCreateOption ? null : emptyMessage}
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setSearch("");
                                        setOpen(false);
                                    }}
                                >
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {showCreateOption && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={handleCreate}
                                        className="text-primary"
                                    >
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        {createLabel} "{search}"
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
