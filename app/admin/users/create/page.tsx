import { UserForm } from "../components/user-form";
import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Create User | DIU QBank Admin",
  description: "Create a new user",
};

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New User"
        description="Add a new user to the system"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/users", label: "Users" },
          { label: "Create User" },
        ]}
      />
      <UserForm />
    </div>
  );
}
