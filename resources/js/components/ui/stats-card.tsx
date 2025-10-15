import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    iconColor?: string;
    className?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor = 'text-blue-600', className }: StatsCardProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900',
                className,
            )}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
                </div>
                <div className={cn('rounded-full bg-slate-100 p-3 dark:bg-slate-800', iconColor)}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}
