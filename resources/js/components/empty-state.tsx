import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
    return (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
            <Icon className="mx-auto mb-4 h-16 w-16 text-blue-400/50 dark:text-blue-500/40" />
            <h3 className="mb-2 text-lg font-medium">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
