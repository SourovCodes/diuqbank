import type {
  AdminCatalog,
  AdminCourse,
  AdminDepartment,
  Department,
} from "@qb/shared";
import { FolderTree, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { ActionDialog } from "~/components/admin/actions";
import { FilterTabs } from "~/components/admin/filter-tabs";
import { EmptyState } from "~/components/empty-state";
import { FormField } from "~/components/form";
import { PageHeader } from "~/components/page-header";
import { SearchableSelect } from "~/components/searchable-select";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { adminGetJson, adminRequest, formObject } from "~/lib/admin.server";
import { plural } from "~/lib/submissions";
import type { Route } from "./+types/admin-catalog";

export const meta: Route.MetaFunction = () => [
  { title: "Catalog — Admin — QuestionBank" },
  { name: "robots", content: "noindex" },
];

const KINDS = {
  departments: { label: "Departments", noun: "department" },
  courses: { label: "Courses", noun: "course" },
  semesters: { label: "Semesters", noun: "semester" },
  "exam-types": { label: "Exam types", noun: "exam type" },
} as const;
type Kind = keyof typeof KINDS;

const isKind = (value: unknown): value is Kind =>
  typeof value === "string" && value in KINDS;

export async function loader({ request }: Route.LoaderArgs) {
  const tab = new URL(request.url).searchParams.get("tab");
  return {
    catalog: await adminGetJson<AdminCatalog>(request, "/catalog"),
    kind: isKind(tab) ? tab : "departments",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent"));
  const kind = form.get("kind");
  if (!isKind(kind))
    throw new Response("Unknown catalog kind", { status: 400 });
  const id = encodeURIComponent(String(form.get("id") ?? ""));
  const body = formObject(form, "intent", "kind", "id");

  switch (intent) {
    case "create":
      return adminRequest(request, intent, "POST", `/${kind}`, body);
    case "update":
      return adminRequest(request, intent, "PATCH", `/${kind}/${id}`, body);
    case "delete":
      return adminRequest(request, intent, "DELETE", `/${kind}/${id}`);
    default:
      throw new Response("Unknown intent", { status: 400 });
  }
}

type Row = {
  id: number;
  name: string;
  questionCount: number;
  submissionCount: number;
  courseCount?: number;
  shortName?: string;
  departmentId?: number;
};

/** Course picker for the "add course" form, submitted as `departmentId`. */
function DepartmentPicker({
  departments,
  defaultValue,
  error,
}: {
  departments: Department[];
  defaultValue: string | null;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="grid gap-1.5">
      <SearchableSelect
        label="Department"
        placeholder="Select a department"
        searchPlaceholder="Search departments…"
        emptyText="No department found."
        options={departments.map((d) => ({
          value: String(d.id),
          label: `${d.name} (${d.shortName})`,
        }))}
        value={value}
        onChange={setValue}
        clearable={false}
        invalid={Boolean(error)}
      />
      {value && <input type="hidden" name="departmentId" value={value} />}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/** Name (and for departments, short name) inputs for the create and rename forms. */
function EntryFields({
  kind,
  row,
  fieldErrors,
}: {
  kind: Kind;
  row?: Row;
  fieldErrors: Record<string, string>;
}) {
  return (
    <>
      <FormField
        label="Name"
        name="name"
        defaultValue={row?.name}
        required
        minLength={2}
        maxLength={100}
        autoFocus
        error={fieldErrors.name}
      />
      {kind === "departments" && (
        <FormField
          label="Short name"
          name="shortName"
          defaultValue={row?.shortName}
          placeholder="e.g. CSE"
          required
          minLength={2}
          maxLength={20}
          error={fieldErrors.shortName}
        />
      )}
    </>
  );
}

function inUse(row: Row) {
  return row.questionCount + row.submissionCount + (row.courseCount ?? 0) > 0;
}

function RowActions({ kind, row }: { kind: Kind; row: Row }) {
  const { noun } = KINDS[kind];
  const blocked = inUse(row);

  return (
    <div className="flex justify-end gap-1">
      <ActionDialog
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Rename ${row.name}`}
          >
            <Pencil aria-hidden />
          </Button>
        }
        title={`Rename ${noun}`}
        description={
          row.questionCount > 0
            ? `Papers filed under it (${plural(row.questionCount, "question")}) show the new name right away.`
            : undefined
        }
        submitLabel="Save"
        pendingLabel="Saving…"
        fields={{ intent: "update", kind, id: String(row.id) }}
      >
        {(fieldErrors) => (
          <EntryFields kind={kind} row={row} fieldErrors={fieldErrors} />
        )}
      </ActionDialog>
      <ActionDialog
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.name}`}
            disabled={blocked}
            title={blocked ? `In use, so it can’t be deleted` : undefined}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 aria-hidden />
          </Button>
        }
        title={`Delete ${noun}?`}
        description={`“${row.name}” is removed from the catalog. This can’t be undone.`}
        submitLabel="Delete"
        pendingLabel="Deleting…"
        destructive
        fields={{ intent: "delete", kind, id: String(row.id) }}
      />
    </div>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className={value === 0 ? "text-muted-foreground" : undefined}>
      {value}
    </span>
  );
}

/** Search, add and the table for one kind of entry. Keyed by kind, so filters reset. */
function CatalogSection({
  catalog,
  kind,
}: {
  catalog: AdminCatalog;
  kind: Kind;
}) {
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const { label, noun } = KINDS[kind];

  const departmentsById = new Map(
    catalog.departments.map((d) => [d.id, d] as const),
  );
  const rowsByKind: Record<Kind, Row[]> = {
    departments: catalog.departments,
    courses: catalog.courses,
    semesters: catalog.semesters,
    "exam-types": catalog.examTypes,
  };

  const needle = query.trim().toLowerCase();
  const rows = rowsByKind[kind].filter(
    (row) =>
      (!needle ||
        row.name.toLowerCase().includes(needle) ||
        row.shortName?.toLowerCase().includes(needle)) &&
      (kind !== "courses" ||
        departmentFilter === null ||
        String(row.departmentId) === departmentFilter),
  );

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            aria-label={`Search ${label.toLowerCase()}`}
            className="pl-9"
          />
        </div>
        {kind === "courses" && (
          <div className="sm:w-64">
            <SearchableSelect
              label="Department"
              placeholder="All departments"
              searchPlaceholder="Search departments…"
              emptyText="No department found."
              options={catalog.departments.map((d) => ({
                value: String(d.id),
                label: `${d.name} (${d.shortName})`,
              }))}
              value={departmentFilter}
              onChange={setDepartmentFilter}
            />
          </div>
        )}
        <ActionDialog
          trigger={
            <Button>
              <Plus aria-hidden />
              Add {noun}
            </Button>
          }
          title={`Add ${noun}`}
          submitLabel="Add"
          pendingLabel="Adding…"
          fields={{ intent: "create", kind }}
        >
          {(fieldErrors) => (
            <>
              {kind === "courses" && (
                <DepartmentPicker
                  departments={catalog.departments}
                  defaultValue={departmentFilter}
                  error={fieldErrors.departmentId}
                />
              )}
              <EntryFields kind={kind} fieldErrors={fieldErrors} />
            </>
          )}
        </ActionDialog>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title={
            needle || departmentFilter
              ? `No matching ${label.toLowerCase()}`
              : `No ${label.toLowerCase()} yet`
          }
          className="m-4"
        />
      ) : (
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="pl-4">Name</TableHead>
              {kind === "departments" && <TableHead>Short name</TableHead>}
              {kind === "courses" && <TableHead>Department</TableHead>}
              {kind === "departments" && (
                <TableHead className="text-right">Courses</TableHead>
              )}
              <TableHead className="text-right">Questions</TableHead>
              <TableHead
                className="text-right"
                title="Pending submissions that propose this entry"
              >
                Proposals
              </TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-72 truncate pl-4 font-medium">
                  {row.name}
                </TableCell>
                {kind === "departments" && (
                  <TableCell className="text-muted-foreground">
                    {(row as AdminDepartment).shortName}
                  </TableCell>
                )}
                {kind === "courses" && (
                  <TableCell className="text-muted-foreground">
                    {departmentsById.get((row as AdminCourse).departmentId)
                      ?.shortName ?? "—"}
                  </TableCell>
                )}
                {kind === "departments" && (
                  <TableCell className="text-right tabular-nums">
                    <Count value={row.courseCount ?? 0} />
                  </TableCell>
                )}
                <TableCell className="text-right tabular-nums">
                  <Count value={row.questionCount} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <Count value={row.submissionCount} />
                </TableCell>
                <TableCell className="pr-4">
                  <RowActions kind={kind} row={row} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

export default function AdminCatalogPage({ loaderData }: Route.ComponentProps) {
  const { catalog, kind } = loaderData;
  const counts: Record<Kind, number> = {
    departments: catalog.departments.length,
    courses: catalog.courses.length,
    semesters: catalog.semesters.length,
    "exam-types": catalog.examTypes.length,
  };
  const tabs = (Object.keys(KINDS) as Kind[]).map((k) => ({
    search: k === "departments" ? "" : `?tab=${k}`,
    label: KINDS[k].label,
    count: counts[k],
    active: k === kind,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manage"
        title="Catalog"
        description="The departments, courses, semesters and exam types papers are filed under. Entries in use can be renamed but not deleted."
      />
      <FilterTabs label="Catalog sections" tabs={tabs} />
      <CatalogSection key={kind} catalog={catalog} kind={kind} />
    </div>
  );
}
