import { Head, router } from '@inertiajs/react';
import { BookOpen, Filter, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { CustomPagination } from '@/components/custom-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Course, Department, ExamType, PaginatedData, Question, QuestionFilters, Semester } from '@/types';

interface QuestionsIndexProps {
    questions: PaginatedData<Question>;
    departments: Department[];
    courses: Course[];
    semesters: Semester[];
    examTypes: ExamType[];
    filters: QuestionFilters;
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'published':
            return 'default';
        case 'pending_review':
            return 'secondary';
        case 'rejected':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function QuestionsIndex({ questions, departments, courses, semesters, examTypes, filters }: QuestionsIndexProps) {
    const [localFilters, setLocalFilters] = useState<QuestionFilters>(filters);

    const applyFilters = useCallback(
        (newFilters: Partial<QuestionFilters>) => {
            const updatedFilters = { ...localFilters, ...newFilters };

            // If department changes, reset course filter
            if ('department' in newFilters && newFilters.department !== localFilters.department) {
                updatedFilters.course = null;
            }

            setLocalFilters(updatedFilters);

            // Build query params, excluding null values
            const params = new URLSearchParams();
            Object.entries(updatedFilters).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value);
                }
            });

            router.get(
                `/questions${params.toString() ? `?${params.toString()}` : ''}`,
                {},
                { preserveState: true, preserveScroll: true },
            );
        },
        [localFilters],
    );

    const clearFilters = useCallback(() => {
        setLocalFilters({
            department: null,
            course: null,
            semester: null,
            exam_type: null,
        });
        router.get('/questions', {}, { preserveState: true, preserveScroll: true });
    }, []);

    const hasActiveFilters = Object.values(filters).some((value) => value !== null);

    // Filter courses based on selected department
    const filteredCourses = localFilters.department ? courses.filter((course) => course.department_id === Number(localFilters.department)) : courses;

    return (
        <>
            <Head title="Questions" />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold">Question Bank</h1>
                    <p className="text-muted-foreground">Browse past exam questions from all departments and courses.</p>
                </div>

                {/* Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Filters</CardTitle>
                            </div>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                    <X className="mr-1 h-4 w-4" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                        <CardDescription>Filter questions by department, course, semester, and exam type.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Department Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Select value={localFilters.department ?? ''} onValueChange={(value) => applyFilters({ department: value || null })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={String(dept.id)}>
                                                {dept.name} ({dept.short_name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Course Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course</label>
                                <Select
                                    value={localFilters.course ?? ''}
                                    onValueChange={(value) => applyFilters({ course: value || null })}
                                    disabled={filteredCourses.length === 0}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All courses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredCourses.map((course) => (
                                            <SelectItem key={course.id} value={String(course.id)}>
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Semester Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Semester</label>
                                <Select value={localFilters.semester ?? ''} onValueChange={(value) => applyFilters({ semester: value || null })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All semesters" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesters.map((sem) => (
                                            <SelectItem key={sem.id} value={String(sem.id)}>
                                                {sem.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Exam Type Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Exam Type</label>
                                <Select value={localFilters.exam_type ?? ''} onValueChange={(value) => applyFilters({ exam_type: value || null })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All exam types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {examTypes.map((type) => (
                                            <SelectItem key={type.id} value={String(type.id)}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {questions.from ?? 0} - {questions.to ?? 0} of {questions.total} questions
                    </p>
                </div>

                {/* Questions Grid */}
                {questions.data.length > 0 ? (
                    <>
                        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {questions.data.map((question) => (
                                <Card key={question.id} className="transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="line-clamp-2 text-base">{question.course?.name ?? 'Unknown Course'}</CardTitle>
                                            <Badge variant={getStatusBadgeVariant(question.status.value)}>{question.status.label}</Badge>
                                        </div>
                                        <CardDescription className="flex flex-wrap gap-2">
                                            {question.department && (
                                                <span className="inline-flex items-center text-xs">{question.department.short_name}</span>
                                            )}
                                            {question.semester && <span className="text-xs">• {question.semester.name}</span>}
                                            {question.exam_type && <span className="text-xs">• {question.exam_type.name}</span>}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(question.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        <CustomPagination currentPage={questions.current_page} totalPages={questions.last_page} />
                    </>
                ) : (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <BookOpen className="h-6 w-6" />
                            </EmptyMedia>
                            <EmptyTitle>No questions found</EmptyTitle>
                            <EmptyDescription>
                                {hasActiveFilters
                                    ? 'Try adjusting your filters to find more questions.'
                                    : 'There are no questions available at the moment. Check back later!'}
                            </EmptyDescription>
                        </EmptyHeader>
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear all filters
                            </Button>
                        )}
                    </Empty>
                )}
            </div>
        </>
    );
}
