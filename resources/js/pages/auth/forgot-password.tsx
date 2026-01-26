import { Form, Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword() {
    return (
        <>
            <Head title="Forgot Password" />

            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Forgot password?</CardTitle>
                        <CardDescription>Enter your email address and we'll send you a link to reset your password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action="/forgot-password" method="post">
                            {({ errors, processing }) => (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            autoComplete="email"
                                            autoFocus
                                            aria-invalid={!!errors.email}
                                        />
                                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? 'Sending...' : 'Send reset link'}
                                    </Button>

                                    <p className="text-center text-sm text-muted-foreground">
                                        Remember your password?{' '}
                                        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                                            Back to login
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
