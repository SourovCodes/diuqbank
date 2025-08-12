import Link from "next/link";
import { FileText, Plus, Pencil } from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedSemesters, deleteSemester } from "./actions";
import { GenericSearch } from "@/components/admin/generic-search";
import { GenericDeleteButton } from "@/components/admin/generic-delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Semesters Management | DIU QBank Admin",
  description: "Manage semesters",
};

interface SemestersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function SemestersPage({
  searchParams,
}: SemestersPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedSemesters(page, 10, search);

  const semesters = data?.semesters ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Semesters"
        description="Manage your semesters"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Semesters" },
        ]}
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/semesters/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Semester
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Semesters List</CardTitle>
            <CardDescription>
              Total: {pagination.totalCount} semester
              {pagination.totalCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <GenericSearch placeholder="Search semesters..." />
        </CardHeader>
        <CardContent>
          {semesters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No semesters found</h3>
              {search ? (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No semesters match your search criteria. Try a different
                  search query or create a new semester.
                </p>
              ) : (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  Get started by creating your first semester.
                </p>
              )}
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/semesters/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Semester
                </Link>
              </Button>
            </div>
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
                    {semesters.map((semester) => (
                      <TableRow key={semester.id}>
                        <TableCell>
                          <div className="font-medium">{semester.name}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">
                            {semester.questionCount}
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
                                href={`/admin/semesters/${semester.id}/edit`}
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <GenericDeleteButton
                              id={semester.id.toString()}
                              name={semester.name}
                              entityName="Semester"
                              deleteAction={deleteSemester}
                              isDisabled={semester.questionCount > 0}
                              disabledReason="Cannot delete a semester with questions"
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
