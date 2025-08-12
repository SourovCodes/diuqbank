"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { semesters } from "@/db/schema";

import {
    semesterFormSchema,
    type SemesterFormValues,
} from "../schemas/semester";
import { createSemester, updateSemester } from "../actions";

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

// Type for Semester based on Drizzle schema
type Semester = typeof semesters.$inferSelect;

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
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter semester name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Semester name should be unique. Example: &quot;Spring 2024&quot;, &quot;Fall 2023&quot;
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
                                onClick={() => router.push("/admin/semesters")}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "Saving..."
                                    : isEditing
                                        ? "Update Semester"
                                        : "Create Semester"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 