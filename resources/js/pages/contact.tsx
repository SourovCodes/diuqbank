import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MainLayout from '@/layouts/main-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Clock, Loader2, Mail, MessageCircle, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

type ContactFormData = {
    name: string;
    email: string;
    message: string;
} & Record<string, string>;

export default function Contact() {
    return (
        <MainLayout>
            <Head title="Contact Us" />

            <div className="container mx-auto px-4 py-16">
                <PageHeader
                    title="Contact"
                    gradientText="Us"
                    description="Have a question, found a bug, or want to collaborate? We would love to hear how we can make DIUQBank better for you."
                />

                <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
                        <CardContent className="p-4 md:p-8">
                            <div className="mb-4 flex items-center md:mb-6">
                                <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 md:mr-4 md:h-12 md:w-12 dark:from-blue-400 dark:to-blue-600">
                                    <MessageSquare className="h-4 w-4 text-white md:h-6 md:w-6" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 md:text-2xl dark:text-white">Send us a message</h2>
                            </div>

                            <ContactForm />
                        </CardContent>
                    </Card>

                    <div className="space-y-4 md:space-y-6">
                        <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <CardContent className="p-4 md:p-6">
                                <h2 className="mb-3 flex items-center text-lg font-bold text-slate-900 md:mb-4 md:text-xl dark:text-white">
                                    <span className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 md:h-8 md:w-8 dark:from-blue-400 dark:to-blue-600">
                                        <Mail className="h-3 w-3 text-white md:h-4 md:w-4" />
                                    </span>
                                    Contact Information
                                </h2>

                                <div className="mt-4 space-y-3 md:mt-6 md:space-y-4">
                                    <div className="flex items-start space-x-3 rounded-lg border border-slate-100 bg-slate-50 p-3 md:p-4 dark:border-slate-700 dark:bg-slate-700/40">
                                        <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500 md:h-5 md:w-5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 md:text-base dark:text-slate-200">General inquiries</p>
                                            <a
                                                href="mailto:support@diuqbank.com"
                                                className="text-sm break-all text-slate-600 transition-colors hover:text-blue-500 md:text-base dark:text-slate-300 dark:hover:text-blue-400"
                                            >
                                                support@diuqbank.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 rounded-lg border border-slate-100 bg-slate-50 p-3 md:p-4 dark:border-slate-700 dark:bg-slate-700/40">
                                        <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500 md:h-5 md:w-5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 md:text-base dark:text-slate-200">Telegram community</p>
                                            <a
                                                href="https://t.me/diuqbank"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm break-all text-slate-600 transition-colors hover:text-blue-500 md:text-base dark:text-slate-300 dark:hover:text-blue-400"
                                            >
                                                https://t.me/diuqbank
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <CardContent className="p-4 md:p-6">
                                <h2 className="mb-3 flex items-center text-lg font-bold text-slate-900 md:mb-4 md:text-xl dark:text-white">
                                    <span className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 md:h-8 md:w-8 dark:from-blue-400 dark:to-blue-600">
                                        <Clock className="h-3 w-3 text-white md:h-4 md:w-4" />
                                    </span>
                                    Response time
                                </h2>
                                <p className="mt-2 text-sm text-slate-600 md:mt-3 md:text-base dark:text-slate-300">
                                    We typically respond to new submissions within 24-72 hours on weekdays. For urgent issues, mention it in your message
                                    so we can prioritise it.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

function ContactForm() {
    const { data, setData, post, processing, errors, reset } = useForm<ContactFormData>({
        name: '',
        email: '',
        message: '',
    });

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        post('/contact', {
            onSuccess: () => {
                reset();
                toast.success('Message sent successfully!', {
                    description: "Thank you for your message. We'll get back to you within 24-72 hours.",
                    duration: 4000,
                });
            },
            onError: (formErrors) => {
                if (Object.keys(formErrors).length > 0) {
                    toast.error('Please review your message', {
                        description: 'Some details need your attention before we can send it.',
                        duration: 5000,
                    });
                } else {
                    toast.error('Something went wrong', {
                        description: 'Please try again or email us directly at support@diuqbank.com.',
                        duration: 5000,
                    });
                }
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-900 md:text-base dark:text-slate-200">
                        Name *
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 md:px-4 md:py-3 md:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 dark:focus:ring-blue-400"
                        placeholder="Your full name"
                        required
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-900 md:text-base dark:text-slate-200">
                        Email *
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 md:px-4 md:py-3 md:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 dark:focus:ring-blue-400"
                        placeholder="you@example.com"
                        required
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-slate-900 md:text-base dark:text-slate-200">
                    Message *
                </Label>
                <Textarea
                    id="message"
                    value={data.message}
                    onChange={(event) => setData('message', event.target.value)}
                    rows={6}
                    className="resize-vertical min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 md:px-4 md:py-3 md:text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 dark:focus:ring-blue-400"
                    placeholder="Tell us how we can help, any feedback, or issues you've spotted..."
                    required
                />
                {errors.message && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>}
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-sm font-medium text-white shadow-md transition-colors duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:px-8 md:py-3 md:text-base dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin md:h-5 md:w-5" />
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4 md:h-5 md:w-5" />
                            <span>Send Message</span>
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
