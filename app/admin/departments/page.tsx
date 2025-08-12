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
import { getPaginatedDepartments, deleteDepartment } from "./actions";
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
  title: "Departments Management | DIU QBank Admin",
  description: "Manage departments",
};

interface DepartmentsPageProps {
  searchParams: Promise<SearchParamsBase>;
}

export default async function DepartmentsPage({
  searchParams,
}: DepartmentsPageProps) {
  const { page, search } = await parseListSearchParams(searchParams);

  const result = await getPaginatedDepartments(page, 10, search);

  const departments = result.success ? result.data?.departments ?? [] : [];
  const pagination = result.success
    ? result.data?.pagination ?? defaultPagination
    : defaultPagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage departments in the system"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { label: "Departments" },
        ]}
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/departments/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Department
            </Link>
          </Button>
        }
      />

      <Card>
        <AdminListHeader
          title="Departments List"
          description={formatTotalLabel("department", pagination.totalCount)}
          searchPlaceholder="Search departments..."
        />
        <CardContent>
          {departments.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No departments found"
              description={
                search
                  ? "No departments match your search criteria. Try a different search query or create a new department."
                  : "Get started by creating your first department."
              }
              action={
                <Button asChild variant="outline">
                  <Link href="/admin/departments/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Department
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
                      <TableHead className="w-[150px]">Short Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Questions
                      </TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell>
                          <div className="font-medium">{department.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {department.shortName}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">
                            {department.questionCount}
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
                                href={`/admin/departments/${department.id}/edit`}
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <GenericDeleteButton
                              id={department.id.toString()}
                              name={department.name}
                              entityName="Department"
                              deleteAction={deleteDepartment}
                              isDisabled={department.questionCount > 0}
                              disabledReason="Cannot delete a department with questions"
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
