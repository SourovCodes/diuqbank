import { FileText, Mail } from "lucide-react";
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
import { getPaginatedSubmissions, deleteSubmission } from "./actions";
import { GenericDeleteButton } from "@/components/admin/generic-delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { EmptyState } from "@/components/admin/empty-state";

export const metadata: Metadata = {
  title: "Contact Submissions | DIU QBank Admin",
  description: "Manage contact form submissions",
};

interface ContactSubmissionsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function ContactSubmissionsPage({
  searchParams,
}: ContactSubmissionsPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedSubmissions(page, 10, search);

  const submissions = data?.submissions ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Submissions"
        description="View and manage contact form submissions"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Contact Submissions" },
        ]}
      />

      <Card>
        <AdminListHeader
          title="Submissions List"
          description={`Total: ${pagination.totalCount} submission${
            pagination.totalCount !== 1 ? "s" : ""
          }`}
          searchPlaceholder="Search submissions..."
        />
        <CardContent>
          {submissions.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No submissions found"
              description={
                search
                  ? "No submissions match your search criteria. Try a different search query."
                  : "No contact form submissions yet."
              }
            />
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead className="w-[250px]">Email</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Message
                      </TableHead>
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="font-medium">{submission.name}</div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${submission.email}`}
                            className="flex items-center hover:text-blue-600 transition-colors"
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            {submission.email}
                          </a>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[400px]">
                          <p className="truncate">{submission.message}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {format(
                              new Date(submission.createdAt),
                              "MMM d, yyyy"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <GenericDeleteButton
                              id={submission.id.toString()}
                              name={`submission from ${submission.name}`}
                              entityName="Contact Submission"
                              deleteAction={deleteSubmission}
                            />
                          </div>
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
