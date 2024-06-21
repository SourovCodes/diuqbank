<x-web-layout>

    <div class="container mx-auto px-2">
        <div
            class="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-900 dark:border-neutral-700 max-w-lg mx-auto">
            <div class="p-4 sm:p-7">
                <div class="text-center">
                    <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Verify Email</h1>
                    <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                        {{ __('Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn\'t receive the email, we will gladly send you another.') }}
                    </p>
                </div>


                <div class="mt-5">
                    @if (session('status') == 'verification-link-sent')
                        <div class="mb-4 font-medium text-sm text-green-600 dark:text-green-400">
                            {{ __('A new verification link has been sent to the email address you provided during registration.') }}
                        </div>
                    @endif
                    <!-- Form -->
                    <form method="POST" action="{{ route('verification.send') }}">
                        @csrf


                        <div class="grid gap-y-4">


                            <button type="submit"
                                    class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                                {{ __('Resend Verification Email') }}
                            </button>
                        </div>
                    </form>
                    <!-- End Form -->


                </div>
            </div>
        </div>
    </div>
</x-web-layout>
