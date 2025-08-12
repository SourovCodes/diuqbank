import Link from "next/link";
import { FileText, Plus, Eye, Pencil } from "lucide-react";
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
import { getPaginatedQuestions, deleteQuestion } from "./actions";
import { GenericSearch } from "@/components/admin/generic-search";
import { GenericDeleteButton } from "@/components/admin/generic-delete-button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "Questions Management | DIU QBank Admin",
    description: "Manage questions",
};

interface QuestionsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        department?: string;
        status?: string;
    }>;
}

function getStatusBadgeVariant(status: string) {
    switch (status) {
        case "published":
            return "default";
        case "pending review":
            return "secondary";
        case "duplicate":
            return "destructive";
        case "rejected":
            return "outline";
        default:
            return "secondary";
    }
}

function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default async function QuestionsPage({
    searchParams,
}: QuestionsPageProps) {
    const awaitedSearchParams = await searchParams;
    const page = parseInt(awaitedSearchParams.page ?? "1", 10);
    const search = awaitedSearchParams.search || undefined;
    const departmentFilter = awaitedSearchParams.department ? parseInt(awaitedSearchParams.department) : undefined;
    const statusFilter = awaitedSearchParams.status || undefined;

    const { data } = await getPaginatedQuestions(page, 10, search, departmentFilter, statusFilter);

    const questions = data?.questions ?? [];
    const pagination = data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Questions
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage questions in the system
                        </p>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/admin/questions/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Question
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                        <CardTitle className="text-xl">Questions List</CardTitle>
                        <CardDescription>
                            Total: {pagination.totalCount} question
                            {pagination.totalCount !== 1 ? "s" : ""}
                        </CardDescription>
                    </div>
                    <GenericSearch placeholder="Search questions..." />
                </CardHeader>
                <CardContent>
                    {questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <div className="rounded-full bg-muted p-3">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">
                                No questions found
                            </h3>
                            {search || departmentFilter || statusFilter ? (
                                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                                    No questions match your search criteria. Try adjusting your filters or create a new question.
                                </p>
                            ) : (
                                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                                    Get started by creating your first question.
                                </p>
                            )}
                            <Button asChild variant="outline" className="mt-2">
                                <Link href="/admin/questions/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Question
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px]">Course & Details</TableHead>
                                            <TableHead className="w-[150px]">Department</TableHead>
                                            <TableHead className="hidden md:table-cell w-[120px]">Status</TableHead>
                                            <TableHead className="hidden lg:table-cell w-[100px]">File Size</TableHead>
                                            <TableHead className="hidden lg:table-cell w-[80px]">Views</TableHead>
                                            <TableHead className="hidden lg:table-cell w-[120px]">Created</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {questions.map((question) => (
                                            <TableRow key={question.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{question.courseName}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {question.semesterName} • {question.examTypeName}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {question.departmentShortName}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant={getStatusBadgeVariant(question.status)}>
                                                        {question.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatFileSize(question.pdfFileSizeInBytes)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <span className="text-sm">{question.viewCount}</span>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(question.createdAt).toLocaleDateString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            asChild
                                                        >
                                                            <a
                                                                href={`${process.env.NEXT_PUBLIC_S3_DOMAIN}/${question.pdfKey}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-center"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                <span className="sr-only">View PDF</span>
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/admin/questions/${question.id}/edit`}
                                                                className="flex items-center justify-center"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Link>
                                                        </Button>
                                                        <GenericDeleteButton
                                                            id={question.id.toString()}
                                                            name={`${question.courseName} - ${question.departmentShortName}`}
                                                            entityName="Question"
                                                            deleteAction={deleteQuestion}
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