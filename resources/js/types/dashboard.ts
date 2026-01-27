import type { Course, Department, ExamType, Semester } from './question';

export type QuestionStatus = 'published' | 'pending_review' | 'rejected';

export interface SubmissionQuestion {
    id: number;
    status: QuestionStatus;
    status_label: string;
    department: Department;
    course: Course;
    semester: Semester;
    exam_type: ExamType;
}

export interface SubmissionItem {
    id: number;
    pdf_url: string | null;
    vote_score: number;
    views: number;
    created_at: string;
    question: SubmissionQuestion;
}

export interface SubmissionsIndexData {
    data: SubmissionItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SubmissionEditData {
    id: number;
    department_id: number;
    course_id: number;
    semester_id: number;
    exam_type_id: number;
    pdf_url: string | null;
    pdf_name: string | null;
}

export interface FormOptions {
    departments: Department[];
    semesters: Semester[];
    courses: Course[];
    examTypes: ExamType[];
}

export interface SubmissionFormData {
    department_id: string;
    course_id: string;
    semester_id: string;
    exam_type_id: string;
    pdf: File | null;
}

export interface SubmissionFormErrors {
    department_id?: string;
    course_id?: string;
    semester_id?: string;
    exam_type_id?: string;
    pdf?: string;
}
