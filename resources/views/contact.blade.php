@extends('layouts.app')

@section('title', 'Contact Us - DIUQBank')

@section('content')
<div class="container mx-auto px-4 py-16">
    <!-- Header section -->
    <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Contact 
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                Us
            </span>
        </h1>
        <div class="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p class="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Have questions or feedback? We'd love to hear from you and help with anything you need.
        </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Contact Form -->
        <div class="lg:col-span-2 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-lg">
            <div class="p-8">
                <div class="flex items-center mb-6">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-4">
                        <x-lucide-message-square class="h-6 w-6 text-white" />
                    </div>
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
                        Send us a message
                    </h2>
                </div>
                
                <!-- Contact Form -->
                <form action="{{ route('contact.store') }}" method="POST" class="space-y-4 md:space-y-6">
                    @csrf
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label for="name" class="block text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium mb-2">
                                Name
                            </label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value="{{ old('name') }}"
                                placeholder="Your name"
                                class="w-full bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-400 transition-colors @error('name') border-red-500 @enderror"
                                required
                            >
                            @error('name')
                                <div class="text-red-500 text-xs md:text-sm mt-1">{{ $message }}</div>
                            @enderror
                        </div>

                        <div>
                            <label for="email_or_phone" class="block text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium mb-2">
                                Email or Phone
                            </label>
                            <input 
                                type="text" 
                                id="email_or_phone" 
                                name="email_or_phone" 
                                value="{{ old('email_or_phone') }}"
                                placeholder="Your email or phone number"
                                class="w-full bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-400 transition-colors @error('email_or_phone') border-red-500 @enderror"
                                required
                            >
                            @error('email_or_phone')
                                <div class="text-red-500 text-xs md:text-sm mt-1">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div>
                        <label for="message" class="block text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium mb-2">
                            Message
                        </label>
                        <textarea 
                            id="message" 
                            name="message" 
                            placeholder="How can we help you?"
                            rows="6"
                            class="w-full bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none @error('message') border-red-500 @enderror"
                            required
                        >{{ old('message') }}</textarea>
                        @error('message')
                            <div class="text-red-500 text-xs md:text-sm mt-1">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="pt-2">
                        <button 
                            type="submit" 
                            class="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 px-4 md:px-6 py-2 md:py-2.5 text-white text-sm md:text-base rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 flex items-center justify-center"
                        >
                            <x-lucide-send class="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            <span>Send Message</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-6">
            <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-lg">
                <div class="p-6">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                        <span class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-2">
                            <x-lucide-mail class="h-4 w-4 text-white" />
                        </span>
                        Contact Information
                    </h2>
                    <div class="space-y-4 mt-6">
                        <div class="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                            <x-lucide-mail class="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                            <div>
                                <p class="font-medium text-slate-900 dark:text-slate-200">
                                    Developer Email
                                </p>
                                <a 
                                    href="mailto:sourov2305101004@diu.edu.bd"
                                    class="text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors break-all"
                                >
                                    sourov2305101004@diu.edu.bd
                                </a>
                            </div>
                        </div>

                        <div class="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                            <x-lucide-message-circle class="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                            <div>
                                <p class="font-medium text-slate-900 dark:text-slate-200">
                                    Facebook Page
                                </p>
                                <a 
                                    href="https://fb.com/diuqbank"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors break-all"
                                >
                                    fb.com/diuqbank
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-lg">
                <div class="p-6">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                        <span class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-2">
                            <x-lucide-clock class="h-4 w-4 text-white" />
                        </span>
                        Response Time
                    </h2>
                    <p class="text-slate-600 dark:text-slate-300 mt-3">
                        We typically respond to inquiries within 24-48 hours during weekdays. For urgent matters, please message us directly on our Facebook page.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>


@endsection
