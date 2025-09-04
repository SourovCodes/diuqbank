"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markContactSubmissionAsRead, markContactSubmissionAsUnread } from "../actions";
import { toast } from "sonner";

interface ContactSubmissionQuickActionsProps {
    submission: {
        id: number;
        email: string;
        subject: string;
        isRead: boolean;
    };
}

export function ContactSubmissionQuickActions({ submission }: ContactSubmissionQuickActionsProps) {
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
        <div className="space-y-3">
            <Button
                variant="outline"
                className="w-full justify-start"
                asChild
            >
                <a href={`mailto:${submission.email}?subject=Re: ${submission.subject}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                </a>
            </Button>

            <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleReadStatus}
                disabled={isUpdating}
            >
                {isUpdating
                    ? "Updating..."
                    : (submission.isRead ? "Mark as Unread" : "Mark as Read")
                }
            </Button>
        </div>
    );
}
