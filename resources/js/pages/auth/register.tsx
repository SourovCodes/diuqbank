import { Form, Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

export default function Register() {
    return (
        <>
            <Head title="Register" />

            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>Enter your details to get started</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action="/register" method="post">
                            {({ errors, processing }) => (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="John Doe"
                                            autoComplete="name"
                                            autoFocus
                                            aria-invalid={!!errors.name}
                                        />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            autoComplete="email"
                                            aria-invalid={!!errors.email}
                                        />
                                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            aria-invalid={!!errors.password}
                                        />
                                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            aria-invalid={!!errors.password_confirmation}
                                        />
                                        {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? 'Creating account...' : 'Create account'}
                                    </Button>

                                    <p className="text-center text-xs text-muted-foreground">
                                        By creating an account, you agree to our{' '}
                                        <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                                            Privacy Policy
                                        </Link>
                                        .
                                    </p>

                                    <p className="text-center text-sm text-muted-foreground">
                                        Already have an account?{' '}
                                        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
