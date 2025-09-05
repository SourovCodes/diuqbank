"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type User as UserModel } from "@/db/schema";

import {
    userFormSchema,
    type UserFormValues,
} from "../schemas/user";
import { createUser, updateUser } from "../actions";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormActions } from "../../components/form-actions";

// Type for User based on Drizzle schema
type User = UserModel;

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
            emailVerified: initialData?.emailVerified || false,
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
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter full name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the user&apos;s full name. Only letters, spaces, apostrophes, and hyphens are allowed.
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
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Enter email address"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter a valid email address. This will be used for login and notifications.
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
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter username"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter a unique username. Only letters, numbers, underscores, and hyphens are allowed.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="emailVerified"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Email Verified
                                            </FormLabel>
                                            <FormDescription>
                                                Check this if the user&apos;s email address has been verified.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormActions
                            backHref="/admin/users"
                            isLoading={isLoading}
                            submitLabel={
                                isEditing ? "Update User" : "Create User"
                            }
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
