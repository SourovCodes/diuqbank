import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';

interface ClearFiltersButtonProps {
    count: number;
}

export function ClearFiltersButton({ count }: ClearFiltersButtonProps) {
    const handleClear = useCallback(() => {
        // Navigate to base URL without any filters
        const url = new URL(window.location.href);
        const baseUrl = url.origin + url.pathname;

        router.visit(baseUrl, {
            preserveState: false,
            preserveScroll: false,
            replace: true,
        });
    }, []);

    return (
        <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 gap-1 text-xs">
            <X className="h-3 w-3" />
            Clear {count > 1 ? `all ${count}` : ''}
        </Button>
    );
}
