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
    selectedDepartment || selectedCourse || selectedSemester || selectedExamType;

  // Sync state with URL params on mount and param changes
  useEffect(() => {
    setSelectedDepartment(searchParams.get("department") || "");
    setSelectedCourse(searchParams.get("course") || "");
    setSelectedSemester(searchParams.get("semester") || "");
    setSelectedExamType(searchParams.get("examType") || "");
  }, [searchParams]);

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Filter Questions</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 px-3 text-xs"
          >
            <FilterX className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Department Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Department
          </label>
          <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.departments.map((department) => (
                <SelectItem key={department.id} value={department.id.toString()}>
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Course
          </label>
          <Select 
            value={selectedCourse} 
            onValueChange={handleCourseChange}
            disabled={!selectedDepartment}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedDepartment ? "All Courses" : "Select Department First"} />
            </SelectTrigger>
            <SelectContent>
              {availableCourses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Semester
          </label>
          <Select value={selectedSemester} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id.toString()}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exam Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Exam Type
          </label>
          <Select value={selectedExamType} onValueChange={handleExamTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Exam Types" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.examTypes.map((examType) => (
                <SelectItem key={examType.id} value={examType.id.toString()}>
                  {examType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedDepartment && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
              <span className="font-medium">Department:</span>
              <span>
                {filterOptions.departments.find(d => d.id.toString() === selectedDepartment)?.shortName}
              </span>
            </div>
          )}
          {selectedCourse && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
              <span className="font-medium">Course:</span>
              <span>
                {filterOptions.courses.find(c => c.id.toString() === selectedCourse)?.name}
              </span>
            </div>
          )}
          {selectedSemester && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
              <span className="font-medium">Semester:</span>
              <span>
                {filterOptions.semesters.find(s => s.id.toString() === selectedSemester)?.name}
              </span>
            </div>
          )}
          {selectedExamType && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-md border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800">
              <span className="font-medium">Exam Type:</span>
              <span>
                {filterOptions.examTypes.find(e => e.id.toString() === selectedExamType)?.name}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
