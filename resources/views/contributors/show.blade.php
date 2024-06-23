<x-web-layout>

    <div class="container mx-auto px-2 mt-10">
        <div class="bg-cover bg-center rounded-sm shadow-sm h-44 md:h-60 xl:h-80"
             style="background-image: url('{{ $user->getFirstMediaUrl('cover-photos', 'preview') }}');">

        </div>
        <div class="flex gap-2 ">
            <div class="ml-2 md:ml-20 -mt-10 md:-mt-20  bg-white  dark:bg-black border dark:border-gray-800 rounded-t-full my-2 p-2">

                <a class="spotlight inline-block rounded-full "
                   href="{{ $user->getMedia('profile-images')->last()?->getUrl() ?? asset('images/user.png') }}">
                    <img class=" rounded-full shadow h-24 w-24 md:h-36 md:w-36 "
                         src="{{ $user->getMedia('profile-images')->last()?->getUrl() ?? asset('images/user.png') }}"
                         alt="">
                </a>
            </div>
            <div class=" bg-white dark:bg-black rounded-sm border dark:border-gray-800 my-2 flex-grow flex items-center p-2">

                <div class="flex items-center bg-emerald-200 w-min rounded-full p-1 mx-1 first:ml-0 last:mr-0">
                    <div class="bg-emerald-300 p-1 rounded-full">
                        <x-svg.user-circle class="stroke-emerald-700 w-3 md:w-5 h-3 md:h-5"/>
                    </div>
                    <div class="mx-1 text-emerald-700">{{ $user->role }}</div>
                </div>

            </div>
        </div>

        <div class="mt-4 bg-white dark:bg-black rounded-sm border dark:border-gray-800 p-3  relative space-y-2">
            <div class="flex gap-3">
                <p class=" font-semibold">Name:</p>
                <p class=" flex-grow">{{ $user->name }}</p>
            </div>
            <div class="flex gap-3">
                <p class=" font-semibold">Email:</p>
                <p class=" flex-grow">{{ $user->email }}</p>
            </div>

            @if ($user->student_id)
                <div class="flex gap-3">
                    <p class=" font-semibold">ID:</p>
                    <p class=" flex-grow">{{ $user->student_id }}</p>
                </div>
            @endif

            @if ($user->phone)
                <div class="flex gap-3">
                    <p class=" font-semibold">Phone:</p>
                    <p class=" flex-grow">{{ $user->phone }}</p>
                </div>
            @endif

            <div class="flex gap-3">
                <p class=" font-semibold">Joined:</p>
                <p class=" flex-grow">{{ $user->created_at->format('d M, Y') }}</p>
            </div>

            @if (auth()->user()?->id == $user->id)
                <a href="{{ route('my-account.profile.edit', $user) }}"
                   class=" absolute  top-0 right-0 bg-primary-300 dark:bg-primary-500 rounded p-2 flex items-center gap-2">
                    <x-svg.edit class="w-5 h-5"/>
                    <span>Edit</span>
                </a>
            @endif
        </div>
    </div>


    <div class="container mx-auto px-2 py-10 space-y-6">
        <h3 class="text-center text-xl font-marry font-semibold">Questions from: {{ $user->name }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 ">

            @foreach ($questions as $question)
                {{--                <x-question.question-list-item :question="$question" />--}}
            @endforeach


        </div>
        @if ($questions->isEmpty())
            <p>No Question Found</p>
        @endif
        <div class="mt-2">
            {{ $questions->links('pagination.tailwind') }}

        </div>
    </div>

</x-web-layout>
