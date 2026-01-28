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
    requires_section?: boolean;
}

export interface Question {
    id: number;
    department?: Department;
    course?: Course;
    semester?: Semester;
    exam_type?: ExamType;
    created_at: string;
}

export interface Submission {
    id: number;
    user: {
        id: number;
        name: string;
    } | null;
    section: string | null;
    pdf_url: string | null;
    vote_score: number;
    user_vote: number | null;
    views: number;
    created_at: string;
}

export interface QuestionFilters {
    department: string | null;
    course: string | null;
    semester: string | null;
    exam_type: string | null;
}
