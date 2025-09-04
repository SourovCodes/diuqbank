"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GenericDeleteButton } from "../../components/generic-delete-button";
import { deleteContactSubmission, markContactSubmissionAsRead, markContactSubmissionAsUnread } from "../actions";
import { toast } from "sonner";

interface ContactSubmissionActionsProps {
    submission: {
        id: number;
        name: string;
        isRead: boolean;
    };
}

export function ContactSubmissionActions({ submission }: ContactSubmissionActionsProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggleReadStatus = async () => {
        setIsUpdating(true);
        try {
            const result = submission.isRead
                ? await markContactSubmissionAsUnread(submission.id.toString())
                : await markContactSubmissionAsRead(submission.id.toString());

            if (result.success) {
                toast.success(
                    submission.isRead
                        ? "Marked as unread"
                        : "Marked as read"
                );
                // The page will revalidate automatically
            } else {
                const errorMessage = typeof result.error === 'string'
                    ? result.error
                    : "Failed to update status";
                toast.error(errorMessage);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={isUpdating}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/admin/contact-submissions/${submission.id}`}
                            className="flex items-center w-full"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleToggleReadStatus}
                        disabled={isUpdating}
                    >
                        {submission.isRead ? "Mark as Unread" : "Mark as Read"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <GenericDeleteButton
                id={submission.id.toString()}
                name={`${submission.name}'s message`}
                entityName="Contact Submission"
                deleteAction={deleteContactSubmission}
            />
        </div>
    );
}
