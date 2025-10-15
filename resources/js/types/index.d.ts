export interface Auth {
    user: User;
}

export interface SharedData {
    name: string;
    auth: Auth;
    flash: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

// Question Resources
export interface QuestionResource {
    id: number;
    created_at: string;
    view_count: number;
    section: string | null;
    department: string;
    course: string;
    semester: string;
    exam_type: string;
    status: string;
    user_id: number;
}

export interface QuestionDetailResource {
    id: number;
    created_at: string;
    view_count: number;
    pdf_size: number;
    pdf_url: string;
    section: string | null;
    status: string;
    department: {
        id: number;
        name: string;
        short_name: string;
    };
    course: {
        id: number;
        name: string;
    };
    semester: {
        id: number;
        name: string;
    };
    exam_type: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
        username: string;
        student_id: string;
        profile_picture_url: string;
    };
}

// Form Options Types
export interface Department {
    id: number;
    name: string;
}

export interface Semester {
    id: number;
    name: string;
}

export interface Course {
    id: number;
    name: string;
    department_id: number;
}

export interface ExamType {
    id: number;
    name: string;
    requires_section: boolean;
}

export interface QuestionFormOptions {
    departments: Department[];
    semesters: Semester[];
    courses: Course[];
    examTypes: ExamType[];
}

// Dashboard Types
export interface DashboardStats {
    total_questions: number;
    published: number;
    pending_review: number;
    need_fix: number;
    total_views: number;
}
