import Link from "next/link";
import { Suspense } from "react";
import {
  Users,
  Building,
  BookOpen,
  CalendarRange,
  FileText,
  HelpCircle,
  Plus,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats, getRecentQuestions } from "./actions";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Get Started
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "pending review":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "duplicate":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}

async function DashboardContent() {
  const [stats, recentQuestions] = await Promise.all([
    getDashboardStats(),
    getRecentQuestions(),
  ]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered users in the system"
          icon={Users}
          href="/admin/users"
        />
        <StatCard
          title="Departments"
          value={stats.totalDepartments}
          description="Academic departments"
          icon={Building}
          href="/admin/departments"
        />
        <StatCard
          title="Courses"
          value={stats.totalCourses}
          description="Available courses"
          icon={BookOpen}
          href="/admin/courses"
        />
        <StatCard
          title="Semesters"
          value={stats.totalSemesters}
          description="Academic semesters"
          icon={CalendarRange}
          href="/admin/semesters"
        />
        <StatCard
          title="Exam Types"
          value={stats.totalExamTypes}
          description="Types of examinations"
          icon={FileText}
          href="/admin/exam-types"
        />
        <StatCard
          title="Questions"
          value={stats.totalQuestions}
          description="Total question papers"
          icon={HelpCircle}
          href="/admin/questions"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Question Status Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Question Status Overview</CardTitle>
            </div>
            <CardDescription>Breakdown of questions by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.questionsByStatus.published}
                </div>
                <div className="text-sm text-muted-foreground">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.questionsByStatus.pending}
                </div>
                <div className="text-sm text-muted-foreground">
                  Pending Review
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.questionsByStatus.rejected}
                </div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Recent Questions</CardTitle>
            </div>
            <CardDescription>Latest question submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentQuestions.length > 0 ? (
                recentQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between space-x-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {question.departmentName} - {question.courseName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {question.semesterName} • {question.examTypeName} •{" "}
                        {question.userName}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(question.status)}
                    >
                      {question.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No questions found
                </p>
              )}
            </div>
            {recentQuestions.length > 0 && (
              <div className="mt-4">
                <Link href="/admin/questions">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Questions
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Add New User"
              description="Create a new user account"
              href="/admin/users/create"
              icon={Users}
            />
            <QuickActionCard
              title="Create Department"
              description="Add a new academic department"
              href="/admin/departments/create"
              icon={Building}
            />
            <QuickActionCard
              title="Add Question"
              description="Upload a new question paper"
              href="/admin/questions/create"
              icon={HelpCircle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Statistics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Overview Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Questions Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your DIUQBank system statistics and recent activity.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
