"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { users } from "@/db/schema";

import {
    userFormSchema,
    type UserFormValues,
} from "../schemas/user";
import { createUser, updateUser } from "../actions";

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

// Type for User based on Drizzle schema
type User = typeof users.$inferSelect;

interface UserFormProps {
    initialData?: User | null;
    isEditing?: boolean;
    userId?: string;
}

export function UserForm({
    initialData,
    isEditing = false,
    userId,
}: UserFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            username: initialData?.username || "",
            studentId: initialData?.studentId || "",
        },
    });

    const onSubmit = async (values: UserFormValues) => {
        setIsLoading(true);
        try {
            let response;

            if (isEditing && userId) {
                response = await updateUser(userId, values);
            } else {
                response = await createUser(values);
            }

            if (response.success) {
                toast.success(
                    isEditing
                        ? "User updated successfully!"
                        : "User created successfully!"
                );
                router.push("/admin/users");
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
                    {isEditing ? "Edit User" : "Create New User"}
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
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter full name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Full name of the user
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Enter email address"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Email address for login and notifications
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter username" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Unique username for the user
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="studentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Student ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter student ID (optional)" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Optional student identification number
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
                                onClick={() => router.push("/admin/users")}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "Saving..."
                                    : isEditing
                                        ? "Update User"
                                        : "Create User"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 