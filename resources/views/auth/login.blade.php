@extends('layouts.app')

@section('title', 'Login')

@section('content')
<div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
        <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl">
            <div class="px-6 pt-6 pb-4 text-center">
                <h1 class="text-xl font-semibold text-slate-900 dark:text-white">Sign in to DIUQBank</h1>
                <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Use your Google account to continue.</p>
            </div>
            <div class="px-6 pb-6">
                @if (session('error'))
                    <div class="mb-3 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2">{{ session('error') }}</div>
                @endif
                <div class="mb-3 text-xs text-slate-600 dark:text-slate-400">
                    Only DIU accounts are allowed: <span class="font-medium">@diu.edu.bd</span> or <span class="font-medium">@s.diu.edu.bd</span>.
                </div>
                <a href="{{ route('auth.google.redirect') }}" class="w-full inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12  s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24  s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.96,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657  C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36  c-5.202,0-9.616-3.317-11.276-7.946l-6.549,5.047C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.238-2.231,4.166-4.091,5.571c0.001-0.001,0.002-0.001,0.003-0.002  l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                    Continue with Google
                </a>
                <p class="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">By continuing, you agree to our Terms and Privacy Policy.</p>
            </div>
        </div>
    </div>
</div>
@endsection
