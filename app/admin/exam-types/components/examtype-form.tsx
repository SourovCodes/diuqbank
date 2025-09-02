"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type ExamType as ExamTypeModel } from "@/db/schema";

import {
    examTypeFormSchema,
    type ExamTypeFormValues,
} from "../schemas/examtype";
import { createExamType, updateExamType } from "../actions";

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
import { Switch } from "@/components/ui/switch";

// Type for ExamType based on Drizzle schema
type ExamType = ExamTypeModel;

interface ExamTypeFormProps {
    initialData?: ExamType | null;
    isEditing?: boolean;
    examTypeId?: string;
}

export function ExamTypeForm({
    initialData,
    isEditing = false,
    examTypeId,
}: ExamTypeFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(examTypeFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            requiresSection: initialData?.requiresSection ?? false,
            order: initialData?.order || 0,
        },
    });

    const onSubmit = async (values: ExamTypeFormValues) => {
        setIsLoading(true);
        try {
            let response;

            if (isEditing && examTypeId) {
                response = await updateExamType(examTypeId, values);
            } else {
                response = await createExamType(values);
            }

            if (response.success) {
                toast.success(
                    isEditing
                        ? "Exam type updated successfully!"
                        : "Exam type created successfully!"
                );
                router.push("/admin/exam-types");
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
                    {isEditing ? "Edit Exam Type" : "Create New Exam Type"}
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
                                        <FormLabel>Exam Type Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter exam type name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Exam type name should be short and descriptive. Example:
                                            &quot;Midterm&quot;, &quot;Final&quot;, &quot;Quiz&quot;
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="requiresSection"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Requires Section
                                            </FormLabel>
                                            <FormDescription>
                                                Enable this if questions for this exam type need to specify a section
                                                (e.g., Section A, B, C for Final exams)
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
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
                                            Lower numbers appear first. Example: Quiz (order: 1), Midterm (order: 2), Final (order: 3)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormActions
                            backHref="/admin/exam-types"
                            isLoading={isLoading}
                            submitLabel={
                                isEditing ? "Update Exam Type" : "Create Exam Type"
                            }
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
