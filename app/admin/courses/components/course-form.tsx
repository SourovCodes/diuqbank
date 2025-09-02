"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type Course as CourseModel } from "@/db/schema";

import {
    courseFormSchema,
    type CourseFormValues,
} from "../schemas/course";
import { createCourse, updateCourse, getAllDepartmentsForCourses } from "../actions";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Type for Course based on Drizzle schema
type Course = CourseModel;

interface CourseFormProps {
    initialData?: Course | null;
    isEditing?: boolean;
    courseId?: string;
}

interface Department {
    id: number;
    name: string;
    shortName: string;
}

export function CourseForm({
    initialData,
    isEditing = false,
    courseId,
}: CourseFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            departmentId: initialData?.departmentId || 0,
        },
    });

    // Load departments on component mount
    useEffect(() => {
        const loadDepartments = async () => {
            const result = await getAllDepartmentsForCourses();
            if (result.success && result.data) {
                setDepartments(result.data);
            }
        };
        loadDepartments();
    }, []);

    const onSubmit = async (values: CourseFormValues) => {
        setIsLoading(true);
        try {
            let response;

            if (isEditing && courseId) {
                response = await updateCourse(courseId, values);
            } else {
                response = await createCourse(values);
            }

            if (response.success) {
                toast.success(
                    isEditing
                        ? "Course updated successfully!"
                        : "Course created successfully!"
                );
                router.push("/admin/courses");
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
                    {isEditing ? "Edit Course" : "Create New Course"}
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
                                        <FormLabel>Course Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter course name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Course name should be descriptive. Example:
                                            &quot;Data Structures and Algorithms&quot;
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            value={field.value ? field.value.toString() : ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map((department) => (
                                                    <SelectItem
                                                        key={department.id}
                                                        value={department.id.toString()}
                                                    >
                                                        {department.name} ({department.shortName})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select the department this course belongs to.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormActions
                            backHref="/admin/courses"
                            isLoading={isLoading}
                            submitLabel={
                                isEditing ? "Update Course" : "Create Course"
                            }
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
