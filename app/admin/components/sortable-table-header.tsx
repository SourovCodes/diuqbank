"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";

interface SortableTableHeaderProps {
    sortKey: string;
    children: React.ReactNode;
    className?: string;
}

export function SortableTableHeader({
    sortKey,
    children,
    className
}: SortableTableHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSortBy = searchParams.get("sortBy");
    const currentSortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null;

    const isActive = currentSortBy === sortKey;
    const nextOrder = isActive && currentSortOrder === "asc" ? "desc" : "asc";

    const handleSort = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sortBy", sortKey);
        params.set("sortOrder", nextOrder);
        params.delete("page"); // Reset to first page when sorting

        router.push(`?${params.toString()}`);
    };

    const getSortIcon = () => {
        if (!isActive) {
            return <ArrowUpDown className="h-4 w-4" />;
        }
        return currentSortOrder === "asc" ? (
            <ChevronUp className="h-4 w-4" />
        ) : (
            <ChevronDown className="h-4 w-4" />
        );
    };

    return (
        <TableHead className={className}>
            <Button
                variant="ghost"
                onClick={handleSort}
                className="h-auto p-0 font-medium hover:bg-transparent hover:text-foreground data-[state=open]:bg-transparent"
            >
                <span className="flex items-center gap-2">
                    {children}
                    {getSortIcon()}
                </span>
            </Button>
        </TableHead>
    );
}
