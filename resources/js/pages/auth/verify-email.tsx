import { Form, Head } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmail() {
    return (
        <>
            <Head title="Verify Email" />

            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Verify your email</CardTitle>
                        <CardDescription>
                            Thanks for signing up! Before getting started, please verify your email address by clicking on the link we just emailed to
                            you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action="/email/verification-notification" method="post">
                            {({ processing }) => (
                                <div className="space-y-4">
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? 'Sending...' : 'Resend verification email'}
                                    </Button>
                                </div>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
