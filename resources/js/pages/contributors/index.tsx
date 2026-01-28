import { Head, router } from '@inertiajs/react';
import { Search, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ContributorCard } from '@/components/contributor-card';
import { CustomPagination } from '@/components/custom-pagination';
import { EmptyState } from '@/components/empty-state';
import { Input } from '@/components/ui/input';
import { index as contributorsIndex } from '@/routes/contributors';
import type { Contributor, PaginatedData } from '@/types';

interface ContributorsIndexProps {
    contributors: PaginatedData<Contributor>;
    filters: {
        search?: string | null;
    };
}

export default function ContributorsIndex({ contributors, filters }: ContributorsIndexProps) {
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const performSearch = useCallback((value: string) => {
        router.get(
            contributorsIndex.url(),
            { search: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, []);

    // Debounced search effect
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchValue !== (filters.search ?? '')) {
                performSearch(searchValue);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchValue, filters.search, performSearch]);

    return (
        <>
            <Head title="Contributors" />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Contributors</h1>
                    <p className="mt-2 text-muted-foreground">
                        Meet the amazing people who contribute questions to help others learn.
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-6 max-w-md">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-blue-600 dark:text-blue-400" />
                    <Input
                        type="search"
                        placeholder="Search contributors..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Contributors Grid */}
                {contributors.data.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No contributors found"
                        description={
                            filters.search
                                ? 'Try adjusting your search terms.'
                                : 'Be the first to contribute questions!'
                        }
                    />
                ) : (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {contributors.data.map((contributor) => (
                            <ContributorCard key={contributor.id} contributor={contributor} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {contributors.data.length > 0 && contributors.meta.last_page > 1 && (
                    <div className="mt-8">
                        <CustomPagination
                            currentPage={contributors.meta.current_page}
                            totalPages={contributors.meta.last_page}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
