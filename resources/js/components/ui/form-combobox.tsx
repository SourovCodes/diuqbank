import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type FormComboboxOption = {
    id: number;
    name: string;
};

type FormComboboxProps = {
    id: string;
    value: string;
    onValueChange: (value: string) => void;
    options: FormComboboxOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
};

export function FormCombobox({
    id,
    value,
    onValueChange,
    options,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No results found.',
    disabled = false,
    error = false,
    className,
}: FormComboboxProps) {
    const [open, setOpen] = useState(false);

    const selectedOption = options.find((option) => String(option.id) === value);
    const displayValue = selectedOption?.name ?? placeholder;

    const handleSelect = (selectedValue: string) => {
        onValueChange(selectedValue);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal',
                        !selectedOption && 'text-muted-foreground',
                        error && 'border-red-500 focus:ring-red-500',
                        className,
                    )}
                >
                    <span className="truncate text-left">{displayValue}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" sideOffset={4}>
                <Command className="w-full">
                    <CommandInput placeholder={searchPlaceholder} autoFocus={false} />
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                        {options.map((option) => (
                            <CommandItem
                                key={option.id}
                                value={String(option.id)}
                                keywords={[option.name]}
                                onSelect={() => handleSelect(String(option.id))}
                                className="cursor-pointer"
                            >
                                <Check className={cn('mr-2 h-4 w-4', value === String(option.id) ? 'opacity-100' : 'opacity-0')} />
                                {option.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
