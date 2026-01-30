import { Link } from '@inertiajs/react';
import { Eye, FileText, ThumbsUp } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { show as showContributor } from '@/routes/contributors';
import type { Contributor } from '@/types';

interface ContributorCardProps {
    contributor: Contributor;
}

export function ContributorCard({ contributor }: ContributorCardProps) {
    return (
        <Link href={showContributor.url(contributor.username)} className="group block">
            <div className="relative h-full overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 ring-2 ring-background">
                        <AvatarImage src={contributor.avatar_url} alt={contributor.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(contributor.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 overflow-hidden">
                        <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                            {contributor.name}
                        </h3>
                        <p className="truncate text-sm text-muted-foreground">@{contributor.username}</p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-lg font-semibold text-foreground">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            {contributor.submissions_count}
                        </div>
                        <p className="text-xs text-muted-foreground">Submissions</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-lg font-semibold text-foreground">
                            <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            {contributor.total_votes}
                        </div>
                        <p className="text-xs text-muted-foreground">Votes</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-lg font-semibold text-foreground">
                            <Eye className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            {contributor.total_views}
                        </div>
                        <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
