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
import { FilterX, Filter } from "lucide-react";
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
    <div className="space-y-4 md:space-y-6">
      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 shadow-md flex items-center justify-center mr-3">
            <Filter className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Search Questions
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Find questions by department, course, semester or exam type
            </p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs sm:self-start bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400 transition-colors rounded-full shadow-sm"
          >
            <FilterX className="h-3.5 w-3.5 mr-1.5" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {/* Department Filter */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Department
          </label>
          <Select
            value={selectedDepartment}
            onValueChange={handleDepartmentChange}
          >
            <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
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

        {/* Course Filter */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Course
          </label>
          <Select
            value={selectedCourse}
            onValueChange={handleCourseChange}
            disabled={!selectedDepartment}
          >
            <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm disabled:opacity-50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
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

        {/* Semester Filter */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-600 dark:text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Semester
          </label>
          <Select value={selectedSemester} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
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

        {/* Exam Type Filter */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-orange-600 dark:text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
              />
            </svg>
            Exam Type
          </label>
          <Select value={selectedExamType} onValueChange={handleExamTypeChange}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
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
