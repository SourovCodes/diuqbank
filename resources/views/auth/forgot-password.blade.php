<x-web-layout>

    <div class="container mx-auto px-2">
        <div class="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-900 dark:border-neutral-700 max-w-lg mx-auto">
            <div class="p-4 sm:p-7">
                <div class="text-center">
                    <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Forgot password?</h1>
                    <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                        Remember your password?
                        <a class="text-blue-600 decoration-2 hover:underline font-medium dark:text-blue-500" href="{{route('login')}}">
                            Sign in here
                        </a>
                    </p>
                </div>

                <div class="mt-5">
                    <!-- Form -->
                    <form method="POST" action="{{ route('password.email') }}">
                        @csrf
                        <div class="grid gap-y-4">
                            <!-- Email Address -->
                            <div>
                                <x-input-label for="email" :value="__('Email')" />
                                <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus />
                                <x-input-error :messages="$errors->get('email')" class="mt-2" />
                            </div>


                            <button type="submit" class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">Reset password</button>
                        </div>
                    </form>
                    <!-- End Form -->
                </div>
            </div>
        </div>
    </div>
</x-web-layout>
