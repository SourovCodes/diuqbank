import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getUser } from "../../actions";
import { PageHeader } from "@/components/admin/page-header";

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

export default async function EditUserPage({ params }: EditUserPageProps) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  if (!userId) {
    notFound();
  }

  const userResult = await getUser(userId);
  if (!userResult.success || !userResult.data) {
    notFound();
  }
  const user = userResult.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit User: ${user.name || user.email}`}
        description="Modify user details"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/users", label: "Users" },
          { label: "Edit User" },
        ]}
      />

      <UserForm initialData={user} isEditing userId={userId} />
    </div>
  );
}
