import { Head, useForm } from '@inertiajs/react';
import { Loader2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/layouts/dashboard-layout';
import { password as passwordRoute, update } from '@/routes/dashboard/profile';
import type { User as UserType } from '@/types';

interface ProfileProps {
    user: UserType;
}

export default function Profile({ user }: ProfileProps) {
    const profileForm = useForm({
        name: user.name,
        username: user.username,
        email: user.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put(update.url(), {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(passwordRoute.url(), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'Profile' }]}>
            <Head title="Profile" />

            <div className="space-y-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground">Manage your account information and password.</p>
                </div>

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>Update your account's profile information and email address.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        placeholder="Your name"
                                    />
                                    {profileForm.errors.name && <p className="text-sm text-destructive">{profileForm.errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={profileForm.data.username}
                                        onChange={(e) => profileForm.setData('username', e.target.value)}
                                        placeholder="your_username"
                                    />
                                    {profileForm.errors.username && <p className="text-sm text-destructive">{profileForm.errors.username}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                        placeholder="your@email.com"
                                    />
                                    {profileForm.errors.email && <p className="text-sm text-destructive">{profileForm.errors.email}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={profileForm.processing}>
                                    {profileForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                                {profileForm.recentlySuccessful && <span className="text-sm text-green-600">Saved!</span>}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Update Password */}
                <Card>
                    <CardHeader>
                        <CardTitle>Update Password</CardTitle>
                        <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    placeholder="Enter current password"
                                />
                                {passwordForm.errors.current_password && (
                                    <p className="text-sm text-destructive">{passwordForm.errors.current_password}</p>
                                )}
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                    {passwordForm.errors.password && <p className="text-sm text-destructive">{passwordForm.errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={passwordForm.processing}>
                                    {passwordForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                                {passwordForm.recentlySuccessful && <span className="text-sm text-green-600">Password updated!</span>}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Account Info */}
                <Card className="border-muted">
                    <CardHeader>
                        <CardTitle className="text-muted-foreground">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 text-sm md:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground">Member Since</dt>
                                <dd className="font-medium">
                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Email Verified</dt>
                                <dd className="font-medium">
                                    {user.email_verified_at ? new Date(user.email_verified_at).toLocaleDateString() : 'Not verified'}
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

Profile.layout = null;
