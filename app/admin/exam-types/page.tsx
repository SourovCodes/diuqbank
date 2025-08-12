import Link from "next/link";
import { FileText, Plus, Pencil } from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
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
import { getPaginatedExamTypes, deleteExamType } from "./actions";
import { GenericDeleteButton } from "@/components/admin/generic-delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { EmptyState } from "@/components/admin/empty-state";
import {
  defaultPagination,
  formatTotalLabel,
  parseListSearchParams,
  SearchParamsBase,
} from "@/lib/action-utils";

export const metadata: Metadata = {
  title: "Exam Types Management | DIU QBank Admin",
  description: "Manage exam types",
};

interface ExamTypesPageProps {
  searchParams: Promise<SearchParamsBase>;
}

export default async function ExamTypesPage({
  searchParams,
}: ExamTypesPageProps) {
  const { page, search } = await parseListSearchParams(searchParams);

  const { data } = await getPaginatedExamTypes(page, 10, search);

  const examTypes = data?.examTypes ?? [];
  const pagination = data?.pagination ?? defaultPagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Types"
        description="Manage exam types in the system"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Exam Types" },
        ]}
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/exam-types/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam Type
            </Link>
          </Button>
        }
      />

      <Card>
        <AdminListHeader
          title="Exam Types List"
          description={formatTotalLabel("exam type", pagination.totalCount)}
          searchPlaceholder="Search exam types..."
        />
        <CardContent>
          {examTypes.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No exam types found"
              description={
                search
                  ? "No exam types match your search criteria. Try a different search query or create a new exam type."
                  : "Get started by creating your first exam type."
              }
              action={
                <Button asChild variant="outline">
                  <Link href="/admin/exam-types/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam Type
                  </Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Questions
                      </TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examTypes.map((examType) => (
                      <TableRow key={examType.id}>
                        <TableCell>
                          <div className="font-medium">{examType.name}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">
                            {examType.questionCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <Link
                                href={`/admin/exam-types/${examType.id}/edit`}
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <GenericDeleteButton
                              id={examType.id.toString()}
                              name={examType.name}
                              entityName="Exam Type"
                              deleteAction={deleteExamType}
                              isDisabled={examType.questionCount > 0}
                              disabledReason="Cannot delete an exam type with questions"
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
