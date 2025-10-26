import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';
import contributorsRoutes from '@/routes/contributors';
import questionsRoutes from '@/routes/questions';
import type { QuestionDetailResource, SharedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Book, Calendar, Clock, Download, Edit, Eye, FileText, Maximize, School, Trash2, XCircle } from 'lucide-react';
import { useEffect } from 'react';

interface QuestionShowProps extends SharedData {
    question: QuestionDetailResource;
}

export default function QuestionShow({ question, auth }: QuestionShowProps) {
    // Track view after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            router.post(
                questionsRoutes.view.url(question.id),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    only: [], // Don't reload any props
                },
            );
        }, 3000); // 3 seconds

        return () => clearTimeout(timer);
    }, [question.id]);

    const isOwnQuestion = auth?.user?.id === question.user.id;
    const isPublished = question.status === 'published';

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            router.delete(questionsRoutes.destroy.url(question.id), {
                onSuccess: () => {
                    router.visit(questionsRoutes.index.url());
                },
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatFileSize = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2);
    };

    const toggleFullscreen = () => {
        const container = document.getElementById('viewerContainer');
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <MainLayout>
            <Head title={`${question.course.name} - Question`} />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href={questionsRoutes.index.url()}
                        className="inline-flex items-center gap-1 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Questions
                    </Link>
                </div>

                {/* Question Header */}
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h1 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{question.course.name}</h1>

                    <div className="mb-4 flex flex-wrap gap-2">
                        <Badge className="bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                            <School className="mr-1 h-3.5 w-3.5" />
                            {question.department.short_name} - {question.department.name}
                        </Badge>
                        <Badge className="bg-blue-100 px-3 py-1 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <FileText className="mr-1 h-3.5 w-3.5" />
                            {question.exam_type.name}
                        </Badge>
                        {question.section && (
                            <Badge className="bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                {question.section}
                            </Badge>
                        )}
                        <Badge className="bg-purple-100 px-3 py-1 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            <Calendar className="mr-1 h-3.5 w-3.5" />
                            {question.semester.name}
                        </Badge>
                        <Badge className="bg-green-100 px-3 py-1 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <Book className="mr-1 h-3.5 w-3.5" />
                            {question.course.name}
                        </Badge>
                    </div>

                    {/* Action Buttons */}
                    {isOwnQuestion && (
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={questionsRoutes.edit.url(question.id)} prefetch>
                                    <Edit className="mr-1.5 h-4 w-4" />
                                    Edit Question
                                </Link>
                            </Button>
                            {!isPublished && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300"
                                >
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    Delete Question
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Status Notice for Non-Published Questions */}
                {isOwnQuestion && !isPublished && (
                    <div className="mb-6">
                        {question.status === 'pending_review' && (
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Only you can see this question</h3>
                                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                            This question is pending review from a moderator. It will be visible to other users once it's approved and
                                            published.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {question.status === 'need_fix' && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Only you can see this question</h3>
                                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                            This question needs fixing as requested by a moderator and is not visible to other users. You may edit and
                                            resubmit it for review.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* PDF Viewer */}
                    <div className="lg:col-span-8">
                        <div className="mb-2 flex justify-end gap-2">
                            {question.pdf_url && (
                                <Button asChild variant="outline" size="sm" className="text-xs">
                                    <a
                                        href={question.pdf_url}
                                        download={`(DIUQBank) ${question.course.name} (${question.department.short_name}), ${question.semester.name}, ${question.exam_type.name}.pdf`}
                                    >
                                        <Download className="mr-1 h-3.5 w-3.5" />
                                        Download
                                    </a>
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="text-xs">
                                <Maximize className="mr-1 h-3.5 w-3.5" />
                                Fullscreen
                            </Button>
                        </div>

                        <div
                            id="viewerContainer"
                            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800"
                        >
                            {question.pdf_url ? (
                                <object
                                    data={question.pdf_url}
                                    type="application/pdf"
                                    className="h-full min-h-[500px] w-full md:min-h-[700px]"
                                    title={question.course.name}
                                >
                                    <iframe
                                        src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(question.pdf_url)}`}
                                        width="100%"
                                        height="100%"
                                        className="min-h-[500px] md:min-h-[700px]"
                                        title={question.course.name}
                                    />
                                </object>
                            ) : (
                                <div className="p-6 text-sm text-slate-600 dark:text-slate-300">PDF is not available.</div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Stats</h2>
                            </div>

                            <div className="space-y-4 p-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/40">
                                        <div className="text-[11px] tracking-wide text-slate-500 uppercase">Views</div>
                                        <div className="mt-1 flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                                            <Eye className="h-3.5 w-3.5" />
                                            {question.view_count}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/40">
                                        <div className="text-[11px] tracking-wide text-slate-500 uppercase">File Size</div>
                                        <div className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                                            {formatFileSize(question.pdf_size)} MB
                                        </div>
                                    </div>
                                    <div className="col-span-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/40">
                                        <div className="text-[11px] tracking-wide text-slate-500 uppercase">Uploaded</div>
                                        <div className="mt-1 flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatDate(question.created_at)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                                    <div className="text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400">Uploaded By</div>
                                    <Link
                                        href={contributorsRoutes.show.url({ user: question.user.username })}
                                        className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-blue-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500"
                                    >
                                        <img
                                            src={question.user.avatar_url}
                                            alt={question.user.name}
                                            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                {question.user.name}
                                            </div>
                                            <div className="truncate text-xs text-slate-500 dark:text-slate-400">@{question.user.username}</div>
                                            {question.user.student_id && (
                                                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                    ID: {question.user.student_id}
                                                </div>
                                            )}
                                        </div>

                                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-blue-500 dark:text-slate-600 dark:group-hover:text-blue-400" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}
