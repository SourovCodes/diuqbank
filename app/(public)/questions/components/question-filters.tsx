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
import { FilterX, Building2, BookOpen, Calendar, Shapes } from "lucide-react";
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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Filter Questions
        </h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-3 text-xs rounded-md border-slate-200 dark:border-slate-700 hover:bg-red-50/60 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400"
          >
            <FilterX className="h-3 w-3 mr-1" /> Reset
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Department */}
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium text-xs">
            <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Department
          </Label>
          <Select
            value={selectedDepartment}
            onValueChange={handleDepartmentChange}
          >
            <SelectTrigger className="w-full h-9 rounded-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-blue-400 dark:focus:border-blue-500">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
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
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium text-xs">
            <BookOpen className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Course
          </Label>
          <Select
            value={selectedCourse}
            onValueChange={handleCourseChange}
            disabled={!selectedDepartment}
          >
            <SelectTrigger className="w-full h-9 rounded-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 disabled:opacity-50 focus:ring-0 focus:border-blue-400 dark:focus:border-blue-500">
              <SelectValue
                placeholder={
                  selectedDepartment ? "All Courses" : "Select Department First"
                }
              />
            </SelectTrigger>
            <SelectContent className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              {availableCourses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester */}
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Semester
          </Label>
          <Select value={selectedSemester} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-full h-9 rounded-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-blue-400 dark:focus:border-blue-500">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              {filterOptions.semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id.toString()}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exam Type */}
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium text-xs">
            <Shapes className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Exam Type
          </Label>
          <Select value={selectedExamType} onValueChange={handleExamTypeChange}>
            <SelectTrigger className="w-full h-9 rounded-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-blue-400 dark:focus:border-blue-500">
              <SelectValue placeholder="All Exam Types" />
            </SelectTrigger>
            <SelectContent className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
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
