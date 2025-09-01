import { PageHeader } from "../../components/page-header";
import { DepartmentForm } from "../components/department-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Department | DIU QBank Admin",
  description: "Create a new department",
};

export default function CreateDepartmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Department"
        description="Add a new department to the system"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/departments", label: "Departments" },
          { label: "Create Department" },
        ]}
      />
      <DepartmentForm />
    </div>
  );
}
