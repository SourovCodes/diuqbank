import type { Course, Department, ExamType, Semester } from "@qb/shared";
import { useId, useState } from "react";
import { Form } from "react-router";
import { FormMessage } from "~/components/form";
import { PdfFileInput } from "~/components/pdf-file-input";
import { SearchableSelect } from "~/components/searchable-select";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  findCourseByName,
  findDepartmentByName,
  findSemesterByName,
} from "~/lib/choices";
import { courseOptions, type SelectOption } from "~/lib/filters";

/** An existing value (by id) or a new name typed by the contributor. */
export type Choice =
  { kind: "existing"; id: string } | { kind: "new"; name: string } | null;

const withArticle = (noun: string) =>
  `${/^[aeiou]/i.test(noun) ? "an" : "a"} ${noun}`;

type ChoiceFieldProps = {
  label: string;
  noun: string;
  options: SelectOption[];
  value: Choice;
  onChange: (value: Choice) => void;
  /** Form field for an existing value's id. */
  idField: string;
  /** Form field for a new name. Omit to only allow existing values. */
  nameField?: string;
  error?: string;
  hint?: string;
  children?: React.ReactNode;
};

function ChoiceField({
  label,
  noun,
  options,
  value,
  onChange,
  idField,
  nameField,
  error,
  hint,
  children,
}: ChoiceFieldProps) {
  return (
    <div className="grid content-start gap-1.5">
      <SearchableSelect
        label={label}
        placeholder={`Select ${withArticle(noun)}`}
        searchPlaceholder={
          nameField ? `Search or add ${noun}…` : `Search ${noun}s…`
        }
        emptyText={
          nameField ? `Type a name to add a new ${noun}.` : `No ${noun} found.`
        }
        options={options}
        value={value?.kind === "existing" ? value.id : null}
        displayLabel={value?.kind === "new" ? `${value.name} (new)` : undefined}
        clearable={false}
        invalid={Boolean(error)}
        onChange={(id) => onChange(id ? { kind: "existing", id } : null)}
        onCreate={
          nameField ? (name) => onChange({ kind: "new", name }) : undefined
        }
        createLabel={(name) => `Add “${name}” as a new ${noun}`}
      />
      {/* Only the chosen shape is submitted: an id, or a new name. */}
      {value?.kind === "existing" && (
        <input type="hidden" name={idField} value={value.id} />
      )}
      {value?.kind === "new" && nameField && (
        <input type="hidden" name={nameField} value={value.name} />
      )}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {children}
    </div>
  );
}

type ContributeFormProps = {
  departments: Department[];
  courses: Course[];
  semesters: Semester[];
  examTypes: ExamType[];
  fieldErrors: Record<string, string>;
  message?: string;
  submitting: boolean;
};

export function ContributeForm({
  departments,
  courses,
  semesters,
  examTypes,
  fieldErrors,
  message,
  submitting,
}: ContributeFormProps) {
  const [department, setDepartment] = useState<Choice>(null);
  const [shortName, setShortName] = useState("");
  const [course, setCourse] = useState<Choice>(null);
  const [semester, setSemester] = useState<Choice>(null);
  const [examType, setExamType] = useState<Choice>(null);
  const shortNameId = useId();

  const errorFor = (...fields: string[]) =>
    fields.map((field) => fieldErrors[field]).find(Boolean);
  const findCourse = (id: string) => courses.find((c) => String(c.id) === id);

  // A typed name that matches an existing value selects that value instead.
  const existing = (match: { id: number } | undefined, fallback: Choice) =>
    match ? ({ kind: "existing", id: String(match.id) } as const) : fallback;

  const changeDepartment = (next: Choice) => {
    const choice =
      next?.kind === "new"
        ? existing(findDepartmentByName(departments, next.name), next)
        : next;
    setDepartment(choice);
    if (choice?.kind !== "new") setShortName("");
    // An existing course only fits its own department.
    if (course?.kind === "existing") {
      const current = findCourse(course.id);
      if (
        choice?.kind !== "existing" ||
        String(current?.departmentId) !== choice.id
      ) {
        setCourse(null);
      }
    }
  };

  const changeCourse = (next: Choice) => {
    const choice =
      next?.kind === "new" && department?.kind === "existing"
        ? existing(
            findCourseByName(courses, Number(department.id), next.name),
            next,
          )
        : next;
    setCourse(choice);
    // Picking an existing course first fills in its department.
    if (choice?.kind === "existing" && department === null) {
      const picked = findCourse(choice.id);
      if (picked) {
        setDepartment({ kind: "existing", id: String(picked.departmentId) });
      }
    }
  };

  const changeSemester = (next: Choice) =>
    setSemester(
      next?.kind === "new"
        ? existing(findSemesterByName(semesters, next.name), next)
        : next,
    );

  // A new department can't contain existing courses.
  const courseChoices =
    department?.kind === "new"
      ? []
      : courseOptions(
          courses,
          departments,
          department?.kind === "existing" ? department.id : null,
        );

  return (
    <Form method="post" encType="multipart/form-data" className="min-w-0">
      <Card className="gap-0 py-0">
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
          <ChoiceField
            label="Department"
            noun="department"
            options={departments.map((d) => ({
              value: String(d.id),
              label: `${d.name} (${d.shortName})`,
            }))}
            value={department}
            onChange={changeDepartment}
            idField="departmentId"
            nameField="customDepartmentName"
            error={errorFor("departmentId", "customDepartmentName")}
          >
            {department?.kind === "new" && (
              <div className="grid gap-1.5 pt-2">
                <Label htmlFor={shortNameId}>
                  Short name{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id={shortNameId}
                  // Omitted from the form when empty.
                  name={
                    shortName.trim() ? "customDepartmentShortName" : undefined
                  }
                  value={shortName}
                  onChange={(event) => setShortName(event.target.value)}
                  placeholder="e.g. ME"
                  maxLength={20}
                  aria-invalid={
                    fieldErrors.customDepartmentShortName ? true : undefined
                  }
                />
                {fieldErrors.customDepartmentShortName && (
                  <p className="text-sm text-destructive">
                    {fieldErrors.customDepartmentShortName}
                  </p>
                )}
              </div>
            )}
          </ChoiceField>

          <ChoiceField
            label="Course"
            noun="course"
            options={courseChoices}
            value={course}
            onChange={changeCourse}
            idField="courseId"
            nameField="customCourseName"
            error={errorFor("courseId", "customCourseName")}
            hint={
              department?.kind === "new"
                ? "Type the course name to add it to the new department."
                : undefined
            }
          />

          <ChoiceField
            label="Semester"
            noun="semester"
            options={semesters.map((s) => ({
              value: String(s.id),
              label: s.name,
            }))}
            value={semester}
            onChange={changeSemester}
            idField="semesterId"
            nameField="customSemesterName"
            error={errorFor("semesterId", "customSemesterName")}
          />

          <ChoiceField
            label="Exam type"
            noun="exam type"
            options={examTypes.map((e) => ({
              value: String(e.id),
              label: e.name,
            }))}
            value={examType}
            onChange={setExamType}
            idField="examTypeId"
            error={errorFor("examTypeId")}
          />

          <div className="sm:col-span-2">
            <PdfFileInput
              label="PDF file"
              name="file"
              error={errorFor("file")}
            />
          </div>

          {message && (
            <div className="sm:col-span-2">
              <FormMessage message={message} />
            </div>
          )}
        </div>

        <div className="flex justify-end border-t bg-muted/30 px-4 py-4 sm:px-6">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? "Uploading…" : "Submit paper"}
          </Button>
        </div>
      </Card>
    </Form>
  );
}
