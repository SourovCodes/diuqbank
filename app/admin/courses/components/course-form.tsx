"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type Course as CourseModel } from "@/db/schema";

import { courseFormSchema, type CourseFormValues } from "../schemas/course";
import {
  createCourse,
  updateCourse,
  getDepartmentsForDropdown,
} from "../actions";
// Removed createDepartment to use a simple select without add-new option

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
import { FormActions } from "@/components/admin/form-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type for Course based on Drizzle schema
type Course = CourseModel;

interface DepartmentOption {
  id: number;
  name: string;
  shortName?: string;
  questionCount?: number;
}

interface CourseFormProps {
  initialData?: Course | null;
  isEditing?: boolean;
  courseId?: string;
}

export function CourseForm({
  initialData,
  isEditing = false,
  courseId,
}: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      departmentId: initialData?.departmentId,
    },
  });

  // Load departments on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      const result = await getDepartmentsForDropdown();
      if (result.success) {
        setDepartments(result.data || []);
      }
    };
    loadDepartments();
  }, []);

  // Removed add-new department flow; using a simple Select instead

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
        <CardTitle>{isEditing ? "Edit Course" : "Create New Course"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Select
                        value={
                          field.value !== undefined
                            ? String(field.value)
                            : undefined
                        }
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Select the department this course belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Course name should be unique within the department.
                      Example: &quot;Data Structures&quot;, &quot;Database
                      Management&quot;
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormActions
              backHref="/admin/courses"
              isLoading={isLoading}
              submitLabel={isEditing ? "Update Course" : "Create Course"}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
