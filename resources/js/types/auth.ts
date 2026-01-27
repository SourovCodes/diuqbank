export type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar_url: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at?: string;
};

export type Auth = {
    user: User;
};
