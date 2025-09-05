import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
    getUser,
    getAllUsers,
    migrateUserQuestions,
} from "../../actions";
import { PageHeader } from "../../../components/page-header";
import { MigrationDialog } from "../../../components/migration-dialog";

import { UserForm } from "../../components/user-form";

interface EditUserPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const metadata: Metadata = {
    title: "Edit User | DIU QBank Admin",
    description: "Edit user details",
};

export default async function EditUserPage({
    params,
}: EditUserPageProps) {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
        notFound();
    }

    const [userResult, allUsersResult] = await Promise.all([
        getUser(userId),
        getAllUsers(),
    ]);

    if (!userResult.success || !userResult.data) {
        notFound();
    }
    const user = userResult.data;

    const allUsers = allUsersResult.success
        ? allUsersResult.data || []
        : [];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Edit User: ${user.name}`}
                description="Modify user details"
                crumbs={[
                    { href: "/admin", label: "Dashboard" },
                    { href: "/admin/users", label: "Users" },
                    { label: "Edit User" },
                ]}
                actions={
                    <MigrationDialog
                        entityType="User"
                        currentEntity={{
                            id: user.id,
                            name: `${user.name} (${user.email})`,
                            questionCount:
                                allUsers.find((u) => u.id === user.id)
                                    ?.questionCount || 0,
                        }}
                        availableEntities={allUsers.map(u => ({
                            ...u,
                            name: `${u.name} (${u.email})`
                        }))}
                        migrateAction={migrateUserQuestions}
                        disabled={allUsers.length <= 1}
                        disabledReason={
                            allUsers.length <= 1
                                ? "No other users available"
                                : undefined
                        }
                    />
                }
            />

            <UserForm
                initialData={user}
                isEditing
                userId={userId}
            />
        </div>
    );
}
