import { CheckCircle, Clock, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { QuestionStatus } from '@/types';

interface StatusBadgeProps {
    status: QuestionStatus;
    label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    const config = {
        published: { icon: CheckCircle, className: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20' },
        pending_review: { icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20' },
        rejected: { icon: XCircle, className: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20' },
    };

    const { icon: Icon, className } = config[status];

    return (
        <Badge variant="outline" className={className}>
            <Icon className="mr-1 h-3 w-3" />
            {label}
        </Badge>
    );
}
