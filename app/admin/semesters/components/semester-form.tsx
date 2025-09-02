"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type Semester as SemesterModel } from "@/db/schema";

import {
    semesterFormSchema,
    type SemesterFormValues,
} from "../schemas/semester";
import { createSemester, updateSemester } from "../actions";

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
import { FormActions } from "../../components/form-actions";

// Type for Semester based on Drizzle schema
type Semester = SemesterModel;

interface SemesterFormProps {
    initialData?: Semester | null;
    isEditing?: boolean;
    semesterId?: string;
}

export function SemesterForm({
    initialData,
    isEditing = false,
    semesterId,
}: SemesterFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SemesterFormValues>({
        resolver: zodResolver(semesterFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            order: initialData?.order || 0,
        },
    });

    const onSubmit = async (values: SemesterFormValues) => {
        setIsLoading(true);
        try {
            let response;

            if (isEditing && semesterId) {
                response = await updateSemester(semesterId, values);
            } else {
                response = await createSemester(values);
            }

            if (response.success) {
                toast.success(
                    isEditing
                        ? "Semester updated successfully!"
                        : "Semester created successfully!"
                );
                router.push("/admin/semesters");
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
                    {isEditing ? "Edit Semester" : "Create New Semester"}
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
                                        <FormLabel>Semester Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter semester name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Semester name should follow the format: Season Year. Example:
                                            &quot;Fall 24&quot;, &quot;Spring 24&quot;, &quot;Summer 24&quot;
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Order</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter display order"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Lower numbers appear first. Example: Fall 24 (order: 1), Spring 25 (order: 2)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormActions
                            backHref="/admin/semesters"
                            isLoading={isLoading}
                            submitLabel={
                                isEditing ? "Update Semester" : "Create Semester"
                            }
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
