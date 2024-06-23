<x-web-layout>

    <div class="container mx-auto px-2 py-10 space-y-6">

        <h3 class="text-center text-3xl font-marry font-semibold">We are thankful to our contributors
        </h3>

        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            @foreach ($contributors as $contributor)
                <a href="{{ route('contributors.show', $contributor) }}">
                    <li class="col-span-1 bg-white dark:bg-black rounded-sm shadow dark:shadow-gray-900 hover:shadow-lg transition-shadow duration-200">
                        <div class="w-full flex items-center justify-between p-6 space-x-6">
                            <div class="flex-1 truncate">
                                <div class="flex items-center space-x-3">
                                    <h3 class=" text-sm font-medium truncate">{{ $contributor->name }}</h3>
                                    {{-- <span
                                        class="flex-shrink-0 inline-block px-2 py-0.5 text-green-800 text-xs font-medium bg-green-100 rounded-full">{{ $contributor->role }}</span> --}}
                                </div>
                                <p class="mt-1 text-gray-500 text-sm truncate">Uploaded
                                    <span class=" text-base font-bold text-gray-900 dark:text-white">
                                        {{ $contributor->questions_count }}</span>
                                    Questions
                                </p>
                            </div>

                            <img class="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
                                 src="{{ $contributor->getFirstMediaUrl('profile-images', 'preview') }}" alt="">
                        </div>


                    </li>
                </a>
            @endforeach
        </ul>

        {{-- <div class="mt-2">
            {{ $contributors->links('pagination.tailwind') }}

        </div> --}}

    </div>

</x-web-layout>
