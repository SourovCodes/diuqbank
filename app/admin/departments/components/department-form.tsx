"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { departments } from "@/db/schema";

import {
    departmentFormSchema,
    type DepartmentFormValues,
} from "../schemas/department";
import { createDepartment, updateDepartment } from "../actions";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Type for Department based on Drizzle schema
type Department = typeof departments.$inferSelect;

interface DepartmentFormProps {
    initialData?: Department | null;
    isEditing?: boolean;
    departmentId?: string;
}

export function DepartmentForm({
    initialData,
    isEditing = false,
    departmentId,
}: DepartmentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            shortName: initialData?.shortName || "",
        },
    });

    const onSubmit = async (values: DepartmentFormValues) => {
        setIsLoading(true);
        try {
            let response;

            if (isEditing && departmentId) {
                response = await updateDepartment(departmentId, values);
            } else {
                response = await createDepartment(values);
            }

            if (response.success) {
                toast.success(
                    isEditing
                        ? "Department updated successfully!"
                        : "Department created successfully!"
                );
                router.push("/admin/departments");
            } else {
                if (typeof response.error === "string") {
                    toast.error(response.error);
                } else {
                    toast.error("Please check the form for errors.");
                }
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing ? "Edit Department" : "Create New Department"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter department name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Department name should be descriptive. Example: &quot;Computer Science &amp; Engineering&quot;
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shortName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter department short name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Short name should be uppercase. Example: &quot;CSE&quot;, &quot;EEE&quot;
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/departments")}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "Saving..."
                                    : isEditing
                                        ? "Update Department"
                                        : "Create Department"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 