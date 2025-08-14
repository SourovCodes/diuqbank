"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FilterX,
  Filter,
  Building2,
  BookOpen,
  Calendar,
  Shapes,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { FilterOptions } from "../actions";

interface QuestionFiltersProps {
  filterOptions: FilterOptions;
}

export function QuestionFilters({ filterOptions }: QuestionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedDepartment, setSelectedDepartment] = useState(
    searchParams.get("department") || ""
  );
  const [selectedCourse, setSelectedCourse] = useState(
    searchParams.get("course") || ""
  );
  const [selectedSemester, setSelectedSemester] = useState(
    searchParams.get("semester") || ""
  );
  const [selectedExamType, setSelectedExamType] = useState(
    searchParams.get("examType") || ""
  );

  // Filter courses based on selected department
  const availableCourses = selectedDepartment
    ? filterOptions.courses.filter(
        (course) => course.departmentId === parseInt(selectedDepartment)
      )
    : filterOptions.courses;

  const updateURL = useCallback(
    (filters: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 when filters change
      params.delete("page");

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedCourse(""); // Reset course when department changes
    updateURL({
      department: value,
      course: "",
      semester: selectedSemester,
      examType: selectedExamType,
    });
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    updateURL({
      department: selectedDepartment,
      course: value,
      semester: selectedSemester,
      examType: selectedExamType,
    });
  };

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    updateURL({
      department: selectedDepartment,
      course: selectedCourse,
      semester: value,
      examType: selectedExamType,
    });
  };

  const handleExamTypeChange = (value: string) => {
    setSelectedExamType(value);
    updateURL({
      department: selectedDepartment,
      course: selectedCourse,
      semester: selectedSemester,
      examType: value,
    });
  };

  const clearAllFilters = () => {
    setSelectedDepartment("");
    setSelectedCourse("");
    setSelectedSemester("");
    setSelectedExamType("");
    updateURL({
      department: "",
      course: "",
      semester: "",
      examType: "",
    });
  };

  const hasActiveFilters =
    selectedDepartment ||
    selectedCourse ||
    selectedSemester ||
    selectedExamType;

  // Sync state with URL params on mount and param changes
  useEffect(() => {
    setSelectedDepartment(searchParams.get("department") || "");
    setSelectedCourse(searchParams.get("course") || "");
    setSelectedSemester(searchParams.get("semester") || "");
    setSelectedExamType(searchParams.get("examType") || "");
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 shadow-sm flex items-center justify-center ring-1 ring-inset ring-white/50 dark:ring-white/10">
            <Filter className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Search Questions
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Filter by department, course, semester and exam type.
            </p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="sm:self-start rounded-full shadow-sm border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-700"
          >
            <FilterX className="h-3.5 w-3.5 mr-1.5" /> Reset
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {/* Department */}
        <div className="space-y-2.5">
          <Label className="text-slate-700 dark:text-slate-300">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Department
          </Label>
          <Select
            value={selectedDepartment}
            onValueChange={handleDepartmentChange}
          >
            <SelectTrigger className="w-full rounded-xl shadow-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white dark:bg-slate-800">
              {filterOptions.departments.map((department) => (
                <SelectItem
                  key={department.id}
                  value={department.id.toString()}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{department.shortName}</span>
                    <span className="text-muted-foreground text-xs">
                      {department.name}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Course */}
        <div className="space-y-2.5">
          <Label className="text-slate-700 dark:text-slate-300">
            <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
            Course
          </Label>
          <Select
            value={selectedCourse}
            onValueChange={handleCourseChange}
            disabled={!selectedDepartment}
          >
            <SelectTrigger className="w-full rounded-xl shadow-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
              <SelectValue
                placeholder={
                  selectedDepartment ? "All Courses" : "Select Department First"
                }
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white dark:bg-slate-800">
              {availableCourses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester */}
        <div className="space-y-2.5">
          <Label className="text-slate-700 dark:text-slate-300">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Semester
          </Label>
          <Select value={selectedSemester} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-full rounded-xl shadow-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white dark:bg-slate-800">
              {filterOptions.semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id.toString()}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exam Type */}
        <div className="space-y-2.5">
          <Label className="text-slate-700 dark:text-slate-300">
            <Shapes className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            Exam Type
          </Label>
          <Select value={selectedExamType} onValueChange={handleExamTypeChange}>
            <SelectTrigger className="w-full rounded-xl shadow-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
              <SelectValue placeholder="All Exam Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white dark:bg-slate-800">
              {filterOptions.examTypes.map((examType) => (
                <SelectItem key={examType.id} value={examType.id.toString()}>
                  {examType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
