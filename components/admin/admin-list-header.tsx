import { ReactNode } from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GenericSearch } from "@/components/admin/generic-search";

interface AdminListHeaderProps {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  right?: ReactNode; // optional extra controls next to search
}

export function AdminListHeader({ title, description, searchPlaceholder = "Search...", right }: AdminListHeaderProps) {
  return (
    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
      <div>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      <div className="flex items-center gap-2">
        {right}
        <GenericSearch placeholder={searchPlaceholder} />
      </div>
    </CardHeader>
  );
}
