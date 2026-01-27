import { Head, router } from '@inertiajs/react';
import { Search, Users } from 'lucide-react';
import { useState } from 'react';

import { ContributorCard } from '@/components/contributor-card';
import { CustomPagination } from '@/components/custom-pagination';
import { Input } from '@/components/ui/input';
import type { Contributor, PaginatedData } from '@/types';

interface ContributorsIndexProps {
    contributors: PaginatedData<Contributor>;
    filters: {
        search?: string | null;
    };
}

export default function ContributorsIndex({ contributors, filters }: ContributorsIndexProps) {
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const handleSearch = (value: string) => {
        setSearchValue(value);
        router.get(
            '/contributors',
            { search: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

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
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search contributors..."
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Contributors Grid */}
                {contributors.data.length === 0 ? (
                    <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
                        <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mb-2 text-lg font-medium">No contributors found</h3>
                        <p className="text-muted-foreground">
                            {filters.search
                                ? 'Try adjusting your search terms.'
                                : 'Be the first to contribute questions!'}
                        </p>
                    </div>
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
