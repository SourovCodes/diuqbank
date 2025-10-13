import { Filter, School, Calendar, Book, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ComboboxFilter } from "@/components/ui/combobox-filter";
import { ClearFiltersButton } from "@/components/ui/clear-filters-button";

type FilterValue = number | null | undefined;

type FilterOption = {
  id: number;
  name: string;
};

type CourseOption = FilterOption & {
  department_id: number;
};

// Define types for component props
type QuestionFiltersProps = {
  initialFilters: {
    department?: FilterValue;
    semester?: FilterValue;
    course?: FilterValue;
    examType?: FilterValue;
  };
  filterOptions: {
    departments: FilterOption[];
    semesters: FilterOption[];
    courses: CourseOption[];
    examTypes: FilterOption[];
  };
};

// Map filter keys for type safety
const filterKeys = {
  department: "department_id",
  semester: "semester_id",
  course: "course_id",
  examType: "exam_type_id",
} as const;

// Type for filter configuration
type FilterConfig = {
  id: keyof typeof filterKeys;
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
  activeClass: string;
};

export function QuestionFilters({
  initialFilters,
  filterOptions,
}: QuestionFiltersProps) {
  const allOptionsMap = {
    department: filterOptions.departments,
    course: filterOptions.courses,
    semester: filterOptions.semesters,
    examType: filterOptions.examTypes,
  } as const;

  // Create filter configs for consistent rendering (reordered: department, course, semester, examType)
  const filterConfigs: FilterConfig[] = [
    {
      id: "department",
      label: "Department",
      icon: <School className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      options: filterOptions.departments,
      activeClass:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "course",
      label: "Course",
      icon: <Book className="h-4 w-4 text-green-600 dark:text-green-400" />,
      options: filterOptions.courses,
      activeClass:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
    {
      id: "semester",
      label: "Semester",
      icon: (
        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      ),
      options: filterOptions.semesters,
      activeClass:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    },
    {
      id: "examType",
      label: "Exam Type",
      icon: <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
      options: filterOptions.examTypes,
      activeClass:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    },
  ];

  // Prepare active filters for display
  const activeFilters = filterConfigs
    .map((config) => {
      const value = initialFilters[config.id];
      if (value === null || value === undefined) return null;

      const selectedOption = allOptionsMap[config.id].find(
        (option) => option.id === value
      );

      if (!selectedOption) return null;

      return {
        id: config.id,
        name: selectedOption.name,
        icon: config.icon,
        activeClass: config.activeClass,
      };
    })
    .filter(Boolean);

  // Get count of active filters
  const activeFilterCount = activeFilters.length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Filter Questions
        </h2>

        {/* Active filter badges - only visible when filters are active */}
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <>
              <div className="flex flex-wrap gap-2 mr-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter?.id}
                    className={cn(
                      "px-2 py-1 transition-all hover:scale-105",
                      filter?.activeClass
                    )}
                  >
                    {filter?.icon}
                    <span className="ml-1">{filter?.name}</span>
                  </Badge>
                ))}
              </div>

              <ClearFiltersButton count={activeFilterCount} />
            </>
          )}
        </div>
      </div>

      {/* Filter comboboxes with responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filterConfigs.map((config) => {
          const rawValue = initialFilters[config.id];
          const currentValue =
            rawValue === null || rawValue === undefined
              ? "all"
              : String(rawValue);
          const isActive = rawValue !== null && rawValue !== undefined;

          return (
            <div key={config.id}>
              <ComboboxFilter
                id={config.id}
                urlParam={filterKeys[config.id]}
                label={config.label}
                icon={config.icon}
                options={config.options}
                value={currentValue}
                isActive={isActive}
              />
            </div>
          );
        })}
      </div>

      {/* Mobile-only active filter count indicator */}
      {hasActiveFilters && activeFilterCount > 1 && (
        <div className="block sm:hidden mt-3 text-sm text-center text-slate-500 dark:text-slate-400">
          {activeFilterCount} active filters
        </div>
      )}
    </div>
  );
}
