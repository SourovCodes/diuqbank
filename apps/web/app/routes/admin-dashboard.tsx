import type { AdminReportList, AdminSubmissionList } from "@qb/shared";
import {
  ArrowRight,
  CheckCircle2,
  Flag,
  Inbox,
  PartyPopper,
  Users,
} from "lucide-react";
import { Link, useRouteLoaderData } from "react-router";
import { StatTile } from "~/components/admin/stat-tile";
import { StatusBreakdown } from "~/components/admin/status-breakdown";
import { SubmissionItem } from "~/components/admin/submission-item";
import { UploadsChart } from "~/components/admin/uploads-chart";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { PageHeader } from "~/components/page-header";
import { Card } from "~/components/ui/card";
import { adminSubmissionUrl, classificationLine } from "~/lib/admin";
import { adminGetJson } from "~/lib/admin.server";
import { formatDate } from "~/lib/dates";
import { REPORT_REASON_LABELS } from "~/lib/engagement";
import { formatCount } from "~/lib/format";
import { plural } from "~/lib/submissions";
import type { loader as adminLoader } from "./admin";
import type { Route } from "./+types/admin-dashboard";

export const meta: Route.MetaFunction = () => [
  { title: "Dashboard — Admin — QuestionBank" },
  { name: "robots", content: "noindex" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const [queue, reports] = await Promise.all([
    adminGetJson<AdminSubmissionList>(
      request,
      `/submissions?status=pending_review&pageSize=5`,
    ),
    adminGetJson<AdminReportList>(
      request,
      `/reports?status=pending&pageSize=5`,
    ),
  ]);
  return { queue: queue.items, reports: reports.items };
}

function PanelHeader({
  title,
  description,
  to,
}: {
  title: string;
  description: string;
  to: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Link
        to={to}
        className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        View all
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

function AllCaughtUp({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-muted-foreground">
      <PartyPopper className="size-5" aria-hidden />
      {text}
    </div>
  );
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { queue, reports } = loaderData;
  const { user, stats } =
    useRouteLoaderData<typeof adminLoader>("routes/admin")!;
  const firstName = user.name.split(" ")[0];
  const { submissions, catalog } = stats;

  const catalogStats = [
    { label: "Departments", value: catalog.departments },
    { label: "Courses", value: catalog.courses },
    { label: "Semesters", value: catalog.semesters },
    { label: "Exam types", value: catalog.examTypes },
    { label: "Total views", value: stats.views },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description={`Good to see you, ${firstName}. Here’s what needs your attention.`}
      />

      <section
        aria-label="Key numbers"
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      >
        <StatTile
          label="Pending review"
          value={submissions.pendingReview}
          icon={Inbox}
          attention
          to="/admin/submissions"
          caption={
            submissions.pendingReview === 0
              ? "The queue is clear"
              : `${plural(submissions.awaitingClassification, "proposes", "propose")} new entries`
          }
        />
        <StatTile
          label="Open reports"
          value={stats.openReports}
          icon={Flag}
          attention
          to="/admin/reports"
          caption="Papers hide at 3 open reports"
        />
        <StatTile
          label="Published papers"
          value={submissions.published}
          icon={CheckCircle2}
          to="/admin/submissions?status=published"
          caption={`Across ${plural(stats.questions, "question")}`}
        />
        <StatTile
          label="Users"
          value={stats.users}
          icon={Users}
          to="/admin/users"
          caption={`${plural(stats.contributors, "contributor")}`}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="p-5 sm:p-6">
          <UploadsChart days={stats.dailySubmissions} />
        </Card>
        <Card className="p-5 sm:p-6">
          <StatusBreakdown counts={submissions} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 overflow-hidden py-0">
          <PanelHeader
            title="Review queue"
            description="Newest papers waiting for a decision"
            to="/admin/submissions"
          />
          {queue.length === 0 ? (
            <AllCaughtUp text="No papers are waiting for review." />
          ) : (
            <ul className="divide-y">
              {queue.map((submission) => (
                <li key={submission.id}>
                  <SubmissionItem submission={submission} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="gap-0 overflow-hidden py-0">
          <PanelHeader
            title="Open reports"
            description="Problems readers flagged on published papers"
            to="/admin/reports"
          />
          {reports.length === 0 ? (
            <AllCaughtUp text="No open reports. Nice." />
          ) : (
            <ul className="divide-y">
              {reports.map((report) => (
                <li key={report.id}>
                  <Link
                    to={adminSubmissionUrl(report.submission.id)}
                    prefetch="intent"
                    className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:px-5"
                  >
                    <span className="mt-0.5 rounded-lg bg-red-500/10 p-2 text-red-700 dark:text-red-400">
                      <Flag className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-medium group-hover:text-primary">
                        {REPORT_REASON_LABELS[report.reason]}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {report.submission.classification.course.name} ·{" "}
                        {classificationLine(report.submission.classification)}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ContributorAvatar
                          name={report.reporter.name}
                          image={report.reporter.image}
                          size="xs"
                        />
                        <span className="truncate">{report.reporter.name}</span>
                        <span aria-hidden>·</span>
                        <span className="shrink-0">
                          {formatDate(report.createdAt)}
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 className="font-semibold">Catalog</h2>
            <p className="text-sm text-muted-foreground">
              What papers are filed under
            </p>
          </div>
          <Link
            to="/admin/catalog"
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Manage
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <dl className="grid grid-cols-2 divide-y sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          {catalogStats.map(({ label, value }) => (
            <div key={label} className="space-y-1 px-5 py-4">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-xl font-semibold">{formatCount(value)}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
