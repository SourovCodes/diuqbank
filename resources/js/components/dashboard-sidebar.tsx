import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, Home, LayoutDashboard, LogOut, User } from 'lucide-react';

import DashboardController from '@/actions/App/Http/Controllers/Dashboard/DashboardController';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { logout } from '@/routes';
import { show as profileShow } from '@/routes/dashboard/profile';
import { index as submissionsIndex } from '@/routes/dashboard/submissions';
import { home } from '@/routes/index';
import type { SharedData } from '@/types';

const navigationItems = [
    {
        title: 'Dashboard',
        url: DashboardController.url(),
        icon: LayoutDashboard,
    },
    {
        title: 'My Submissions',
        url: submissionsIndex.url(),
        icon: FileText,
    },
    {
        title: 'Profile',
        url: profileShow.url(),
        icon: User,
    },
];

export function DashboardSidebar() {
    const { auth, url } = usePage<SharedData & { url: string }>().props;
    const currentPath = url?.split('?')[0] ?? '';

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-3">
                    <Link href={home.url()} className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold">DIU QBank</span>
                    </Link>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={currentPath === item.url}>
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={home.url()}>
                                        <Home className="h-4 w-4" />
                                        <span>Back to Website</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                {auth?.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                            </div>
                            <div className="flex flex-1 flex-col truncate">
                                <span className="truncate text-sm font-medium">{auth?.user?.name ?? 'User'}</span>
                                <span className="truncate text-xs text-muted-foreground">{auth?.user?.email ?? ''}</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={logout.url()} method="post" as="button" className="w-full">
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
