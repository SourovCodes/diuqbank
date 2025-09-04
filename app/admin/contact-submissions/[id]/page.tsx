import { notFound } from "next/navigation";
import { Calendar, User, MessageSquare } from "lucide-react";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getContactSubmission, markContactSubmissionAsRead } from "../actions";
import { PageHeader } from "../../components/page-header";
import { ContactSubmissionDetailActions } from "../components/contact-submission-detail-actions";
import { ContactSubmissionQuickActions } from "../components/contact-submission-quick-actions";

interface ContactSubmissionPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ContactSubmissionPageProps): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Contact Submission #${id} | DIU QBank Admin`,
        description: "View contact form submission details",
    };
}

export default async function ContactSubmissionPage({ params }: ContactSubmissionPageProps) {
    const { id } = await params;

    const result = await getContactSubmission(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const submission = result.data;

    // Auto-mark as read when viewing (but don't wait for it)
    if (!submission.isRead) {
        markContactSubmissionAsRead(id);
    }

    // Helper function to format date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Contact Submission #${submission.id}`}
                description="View and manage contact form submission"
                crumbs={[
                    { href: "/admin", label: "Dashboard" },
                    { href: "/admin/contact-submissions", label: "Contact Submissions" },
                    { label: `#${submission.id}` },
                ]}
                actions={
                    <ContactSubmissionDetailActions
                        submission={{
                            id: submission.id,
                            name: submission.name,
                            isRead: submission.isRead
                        }}
                    />
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Subject and Message */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Subject
                                </CardTitle>
                                <Badge variant={submission.isRead ? "secondary" : "default"}>
                                    {submission.isRead ? "Read" : "New"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {submission.subject}
                                </h3>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-medium text-foreground mb-3">Message</h4>
                                <div className="bg-muted/50 rounded-lg p-4">
                                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                        {submission.message}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-foreground font-medium">{submission.name}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-foreground">
                                    <a
                                        href={`mailto:${submission.email}`}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                    >
                                        {submission.email}
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submission Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Submission Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                                <p className="text-foreground">{formatDate(submission.createdAt)}</p>
                            </div>

                            {submission.updatedAt.getTime() !== submission.createdAt.getTime() && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                    <p className="text-foreground">{formatDate(submission.updatedAt)}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="mt-1">
                                    <Badge variant={submission.isRead ? "secondary" : "default"}>
                                        {submission.isRead ? "Read" : "Unread"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ContactSubmissionQuickActions
                                submission={{
                                    id: submission.id,
                                    email: submission.email,
                                    subject: submission.subject,
                                    isRead: submission.isRead
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
