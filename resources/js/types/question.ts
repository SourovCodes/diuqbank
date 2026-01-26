export interface QuestionStatus {
    value: string;
    label: string;
}

export interface Department {
    id: number;
    name: string;
    short_name: string;
}

export interface Course {
    id: number;
    name: string;
    department_id?: number;
}

export interface Semester {
    id: number;
    name: string;
}

export interface ExamType {
    id: number;
    name: string;
}

export interface Question {
    id: number;
    title: string;
    status: QuestionStatus;
    department?: Department;
    course?: Course;
    semester?: Semester;
    exam_type?: ExamType;
    created_at: string;
}

export interface QuestionFilters {
    department: string | null;
    course: string | null;
    semester: string | null;
    exam_type: string | null;
}
