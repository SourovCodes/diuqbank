"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Generic schema for name validation
const nameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .regex(
      /^[a-zA-Z0-9\s&()-]+$/,
      "Name can only contain letters, numbers, spaces, and &()-"
    ),
});

type NameFormValues = z.infer<typeof nameSchema>;

interface DropdownOption {
  id: number;
  name: string;
  shortName?: string; // For departments
  questionCount?: number;
}

interface DropdownWithAddProps {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  value?: string;
  onValueChange: (value: string) => void;
  onAddNew: (
    name: string
  ) => Promise<{ success: boolean; error?: string; data?: DropdownOption }>;
  addDialogTitle: string;
  addDialogDescription: string;
  disabled?: boolean;
  className?: string;
}

export function DropdownWithAdd({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  onAddNew,
  addDialogTitle,
  addDialogDescription,
  disabled = false,
  className,
}: DropdownWithAddProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState(options);

  // Keep currentOptions in sync with props
  useEffect(() => {
    setCurrentOptions(options);
  }, [options]);

  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleAddNew = async (values: NameFormValues) => {
    setIsLoading(true);
    try {
      const result = await onAddNew(values.name);

      if (result.success && result.data) {
        // Add the new option to the current options
        const newOption = result.data;

        // Update the options first
        setCurrentOptions((prev) => [...prev, newOption]);

        // Close dialog and reset form first
        setIsDialogOpen(false);
        form.reset();

        // Then select the newly created option
        onValueChange(newOption.id.toString());

        toast.success(`${label} created successfully!`);
      } else {
        toast.error(result.error || `Failed to create ${label.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Error creating ${label.toLowerCase()}:`, error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    form.handleSubmit(handleAddNew)(event);
  };

  const formatOptionText = (option: DropdownOption) => {
    let text = option.name;

    // Add shortName if it exists (for departments)
    if (option.shortName) {
      text += ` (${option.shortName})`;
    }

    // Add question count if it exists
    if (option.questionCount !== undefined) {
      text += ` - ${option.questionCount} question${
        option.questionCount !== 1 ? "s" : ""
      }`;
    }

    return text;
  };

  return (
    <>
      <div className={className}>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select
              key={`${currentOptions.length}-${value || "none"}`} // Force re-render when options or value change
              onValueChange={onValueChange}
              value={value}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {currentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {formatOptionText(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            disabled={disabled}
            title={`Add new ${label.toLowerCase()}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{addDialogTitle}</DialogTitle>
            <DialogDescription>{addDialogDescription}</DialogDescription>
          </DialogHeader>

          <div onClick={(e) => e.stopPropagation()}>
            <Form {...form}>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Enter ${label.toLowerCase()} name`}
                          {...field}
                          disabled={isLoading}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              const formEvent = e as unknown as React.FormEvent;
                              handleFormSubmit(formEvent);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDialogOpen(false);
                      form.reset();
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {isLoading ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
