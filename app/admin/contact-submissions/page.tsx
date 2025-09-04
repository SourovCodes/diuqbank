import { Mail } from "lucide-react";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedContactSubmissions } from "./actions";
import { PageHeader } from "../components/page-header";
import { Badge } from "@/components/ui/badge";
import { AdminListHeader } from "../components/admin-list-header";
import { EmptyState } from "../components/empty-state";
import { SortableTableHeader } from "../components/sortable-table-header";
import { ContactSubmissionActions } from "./components/contact-submission-actions";
import {
    defaultPagination,
    formatTotalLabel,
    parseListSearchParams,
    SearchParamsBase,
} from "@/lib/action-utils";

export const metadata: Metadata = {
    title: "Contact Submissions | DIU QBank Admin",
    description: "Manage contact form submissions",
};

interface ContactSubmissionsPageProps {
    searchParams: Promise<SearchParamsBase>;
}

export default async function ContactSubmissionsPage({
    searchParams,
}: ContactSubmissionsPageProps) {
    const { page, search, sortBy, sortOrder } = await parseListSearchParams(searchParams);

    const result = await getPaginatedContactSubmissions(page, 10, search, sortBy, sortOrder);

    const submissions = result.success ? result.data?.submissions ?? [] : [];
    const pagination = result.success
        ? result.data?.pagination ?? defaultPagination
        : defaultPagination;

    // Helper function to format date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    // Helper function to truncate message
    const truncateMessage = (message: string, maxLength: number = 100) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + "...";
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Contact Submissions"
                description="Manage contact form submissions from users"
                crumbs={[
                    { href: "/admin", label: "Dashboard" },
                    { label: "Contact Submissions" },
                ]}
            />

            <Card>
                <AdminListHeader
                    title="Contact Submissions List"
                    description={formatTotalLabel("submission", pagination.totalCount)}
                    searchPlaceholder="Search by name, email, subject, or message..."
                />
                <CardContent>
                    {submissions.length === 0 ? (
                        <EmptyState
                            icon={<Mail className="h-6 w-6" />}
                            title="No contact submissions found"
                            description={
                                search
                                    ? "No contact submissions match your search criteria. Try a different search query."
                                    : "No contact submissions have been received yet."
                            }
                        />
                    ) : (
                        <>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Status</TableHead>
                                            <SortableTableHeader sortKey="name" className="w-[150px]">
                                                Name
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="email" className="w-[200px]">
                                                Email
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="subject" className="w-[250px]">
                                                Subject
                                            </SortableTableHeader>
                                            <TableHead className="hidden md:table-cell">Message</TableHead>
                                            <SortableTableHeader sortKey="createdAt" className="w-[120px]">
                                                Date
                                            </SortableTableHeader>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map((submission) => (
                                            <TableRow key={submission.id} className={!submission.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}>
                                                <TableCell>
                                                    <Badge variant={submission.isRead ? "secondary" : "default"}>
                                                        {submission.isRead ? "Read" : "New"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{submission.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">{submission.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{submission.subject}</div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="text-sm text-muted-foreground">
                                                        {truncateMessage(submission.message)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(submission.createdAt)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <ContactSubmissionActions
                                                        submission={{
                                                            id: submission.id,
                                                            name: submission.name,
                                                            isRead: submission.isRead
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-6 flex justify-center">
                                <CustomPagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
