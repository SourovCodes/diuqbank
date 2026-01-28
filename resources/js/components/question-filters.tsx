import { Book, Calendar, FileText, Filter, School } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ClearFiltersButton } from '@/components/ui/clear-filters-button';
import { ComboboxFilter } from '@/components/ui/combobox-filter';
import type { Course, Department, ExamType, Semester } from '@/types';

type FilterValue = number | null | undefined;

interface QuestionFiltersProps {
    initialFilters: {
        department?: FilterValue;
        semester?: FilterValue;
        course?: FilterValue;
        examType?: FilterValue;
    };
    filterOptions: {
        departments: Department[];
        semesters: Semester[];
        courses: Course[];
        examTypes: ExamType[];
    };
}

const filterKeys = {
    department: 'department_id',
    semester: 'semester_id',
    course: 'course_id',
    examType: 'exam_type_id',
} as const;

interface FilterConfig {
    id: keyof typeof filterKeys;
    label: string;
    icon: React.ReactNode;
    options: Array<{ id: number; name: string }>;
}

export function QuestionFilters({ initialFilters, filterOptions }: QuestionFiltersProps) {
    const allOptionsMap = {
        department: filterOptions.departments,
        course: filterOptions.courses,
        semester: filterOptions.semesters,
        examType: filterOptions.examTypes,
    } as const;

    const filterConfigs: FilterConfig[] = [
        {
            id: 'department',
            label: 'Department',
            icon: <School className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
            options: filterOptions.departments,
        },
        {
            id: 'course',
            label: 'Course',
            icon: <Book className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
            options: filterOptions.courses,
        },
        {
            id: 'semester',
            label: 'Semester',
            icon: <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
            options: filterOptions.semesters,
        },
        {
            id: 'examType',
            label: 'Exam Type',
            icon: <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
            options: filterOptions.examTypes,
        },
    ];

    const activeFilters = filterConfigs
        .map((config) => {
            const value = initialFilters[config.id];
            if (value === null || value === undefined) return null;

            const selectedOption = allOptionsMap[config.id].find((option) => option.id === value);

            if (!selectedOption) return null;

            return {
                id: config.id,
                name: selectedOption.name,
                icon: config.icon,
            };
        })
        .filter(Boolean);

    const activeFilterCount = activeFilters.length;
    const hasActiveFilters = activeFilterCount > 0;

    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
                    <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Filter Questions
                </h2>

                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="mr-2 flex flex-wrap gap-2">
                            {activeFilters.map((filter) => (
                                <Badge
                                    key={filter?.id}
                                    className="gap-1 bg-primary/10 px-2 py-1 text-primary hover:bg-primary/20"
                                >
                                    {filter?.icon}
                                    <span>{filter?.name}</span>
                                </Badge>
                            ))}
                        </div>

                        <ClearFiltersButton count={activeFilterCount} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filterConfigs.map((config) => {
                    const rawValue = initialFilters[config.id];
                    const currentValue = rawValue === null || rawValue === undefined ? 'all' : String(rawValue);
                    const isActive = rawValue !== null && rawValue !== undefined;

                    return (
                        <ComboboxFilter
                            key={config.id}
                            id={config.id}
                            urlParam={filterKeys[config.id]}
                            label={config.label}
                            icon={config.icon}
                            options={config.options}
                            value={currentValue}
                            isActive={isActive}
                        />
                    );
                })}
            </div>
        </div>
    );
}
