"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenericDeleteButton } from "../../components/generic-delete-button";
import { deleteContactSubmission, markContactSubmissionAsRead, markContactSubmissionAsUnread } from "../actions";
import { toast } from "sonner";

interface ContactSubmissionDetailActionsProps {
    submission: {
        id: number;
        name: string;
        isRead: boolean;
    };
}

export function ContactSubmissionDetailActions({ submission }: ContactSubmissionDetailActionsProps) {
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
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                onClick={handleToggleReadStatus}
                disabled={isUpdating}
            >
                {isUpdating
                    ? "Updating..."
                    : (submission.isRead ? "Mark as Unread" : "Mark as Read")
                }
            </Button>
            <GenericDeleteButton
                id={submission.id.toString()}
                name={`${submission.name}'s message`}
                entityName="Contact Submission"
                deleteAction={deleteContactSubmission}
            />
            <Button asChild variant="outline">
                <Link href="/admin/contact-submissions">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                </Link>
            </Button>
        </div>
    );
}
