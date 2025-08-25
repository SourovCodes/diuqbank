@extends('layouts.app')

@section('title', 'Privacy Policy')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <!-- Header section -->
    <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Privacy
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                Policy
            </span>
        </h1>
        <div class="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p class="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            How we collect, use, and protect your personal information
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Last updated: {{ date('F j, Y') }}
        </p>
    </div>

    <!-- Introduction -->
    <div class="mb-10 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
        <div class="p-8">
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-4">
                    <x-lucide-shield class="h-6 w-6 text-white" />
                </div>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
                    Introduction
                </h2>
            </div>

            <div class="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                    DIUQBank ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
                    how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
                <p>
                    Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                    please do not access the site.
                </p>
                <p>
                    We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert 
                    you about any changes by updating the "Last updated" date of this Privacy Policy. Any changes or modifications 
                    will be effective immediately upon posting the updated Privacy Policy on the site.
                </p>
            </div>
        </div>
    </div>

    <!-- Information We Collect and Data Usage -->
    <div class="grid md:grid-cols-2 gap-8 mb-10">
        <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
            <div class="p-8 h-full">
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                        <x-lucide-file-text class="h-5 w-5 text-white" />
                    </div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">
                        Information We Collect
                    </h2>
                </div>

                <div class="space-y-4 text-slate-600 dark:text-slate-300">
                    <p>
                        <strong>Personal Data</strong>: When you register for an account, we collect your name, email address, 
                        and profile picture. For DIU students, we also collect your student ID.
                    </p>
                    <p>
                        <strong>User Content</strong>: We collect information related to the PDF files you upload, including 
                        metadata, titles, descriptions, and the content of the PDFs themselves.
                    </p>
                    <p>
                        <strong>Usage Data</strong>: We automatically collect information about your interactions with our platform, 
                        including pages visited, features used, and time spent on the platform.
                    </p>
                    <p>
                        <strong>Device Information</strong>: We collect information about the device you use to access our services, 
                        including operating system, browser type, and IP address.
                    </p>
                </div>
            </div>
        </div>

        <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
            <div class="p-8 h-full">
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                        <x-lucide-eye class="h-5 w-5 text-white" />
                    </div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">
                        How We Use Your Information
                    </h2>
                </div>

                <div class="space-y-4 text-slate-600 dark:text-slate-300">
                    <p>We use the information we collect to:</p>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process and manage your account registration</li>
                        <li>Fulfill and manage your uploads and downloads</li>
                        <li>Respond to your inquiries and resolve disputes</li>
                        <li>Send you technical notices and updates</li>
                        <li>Monitor usage patterns and analyze trends</li>
                        <li>Protect against unauthorized access and potential abuse</li>
                        <li>Personalize your experience on our platform</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Data Security and User Rights -->
    <div class="grid md:grid-cols-2 gap-8 mb-10">
        <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
            <div class="p-8 h-full">
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                        <x-lucide-lock class="h-5 w-5 text-white" />
                    </div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">
                        Data Security
                    </h2>
                </div>

                <div class="space-y-4 text-slate-600 dark:text-slate-300">
                    <p>
                        We implement appropriate technical and organizational measures to protect the security of your personal 
                        information. However, please be aware that no method of transmission over the Internet or electronic 
                        storage is 100% secure.
                    </p>
                    <p>
                        We restrict access to your personal information to those employees, contractors, and service providers 
                        who need to know that information to provide services to you. They are subject to confidentiality 
                        obligations and may be disciplined or terminated if they fail to meet these obligations.
                    </p>
                    <p>
                        In the event of a data breach that affects your personal information, we will make all notifications 
                        as required by applicable law.
                    </p>
                </div>
            </div>
        </div>

        <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
            <div class="p-8 h-full">
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                        <x-lucide-user-check class="h-5 w-5 text-white" />
                    </div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">
                        Your Rights
                    </h2>
                </div>

                <div class="space-y-4 text-slate-600 dark:text-slate-300">
                    <p>You have the right to:</p>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>Access the personal information we hold about you</li>
                        <li>Request that we correct any inaccurate personal information</li>
                        <li>Request deletion of your personal information under certain circumstances</li>
                        <li>Object to our processing of your personal information</li>
                        <li>Request the restriction of processing of your personal information</li>
                        <li>Request the transfer of your personal information to another party</li>
                    </ul>
                    <p class="mt-4">
                        To exercise any of these rights, please contact us at 
                        <a href="mailto:sourov2305101004@diu.edu.bd" class="text-blue-600 dark:text-blue-400 hover:underline">
                            sourov2305101004@diu.edu.bd
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Cookies and Third-Party Services -->
    <div class="mb-10 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
        <div class="p-8">
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                    <x-lucide-cookie class="h-5 w-5 text-white" />
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Cookies and Third-Party Services
                </h2>
            </div>

            <div class="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                    <strong>Cookies</strong>: We use cookies and similar tracking technologies to track activity on our site 
                    and hold certain information. Cookies are files with a small amount of data that may include an anonymous 
                    unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
                <p>
                    <strong>Third-Party Services</strong>: We may use third-party services such as Google Analytics and Google 
                    Authentication to collect, monitor, and analyze user data. These third parties have access to your personal 
                    information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
            </div>
        </div>
    </div>

    <!-- Data Retention -->
    <div class="mb-10 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
        <div class="p-8">
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                    <x-lucide-archive class="h-5 w-5 text-white" />
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Data Retention
                </h2>
            </div>

            <div class="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                    We retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
                    Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
                <p>
                    When we no longer need your personal information, we will securely delete or destroy it. In some cases, 
                    we may anonymize your personal information so that it can no longer be associated with you.
                </p>
            </div>
        </div>
    </div>

    <!-- Contact Us -->
    <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
        <div class="p-8">
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                    <x-lucide-mail class="h-5 w-5 text-white" />
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Contact Us
                </h2>
            </div>

            <div class="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                    If you have questions or concerns about this Privacy Policy, please contact us at:
                </p>
                <p>
                    <a href="mailto:sourov2305101004@diu.edu.bd" class="text-blue-600 dark:text-blue-400 hover:underline">
                        sourov2305101004@diu.edu.bd
                    </a>
                </p>
                <p>
                    You can also visit our 
                    <a href="{{ route('contact') }}" class="text-blue-600 dark:text-blue-400 hover:underline">
                        Contact page
                    </a> 
                    for more ways to reach us.
                </p>
            </div>
        </div>
    </div>
</div>
@endsection
