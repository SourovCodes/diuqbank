<x-web-layout>
    <div class="container mx-auto px-2 text-center py-14 ">
        <p class="mx-auto -mt-4 max-w-2xl text-lg tracking-tight text-gray-700 dark:text-gray-300 sm:mt-6">Welcome to
            <span class="border-b border-dotted border-gray-300">DIU-QBank</span>
        </p>

        <h1 class="mx-auto max-w-4xl font-semibold text-5xl tracking-tight sm:text-6xl font-marry mt-2">
        <span class="inline-block">DIU
            <span class="relative whitespace-nowrap text-blue-600">
            <svg aria-hidden="true" viewBox="0 0 418 42"
                 class="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-500 opacity-40" preserveAspectRatio="none"><path
                    d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path></svg>
            <span class="relative">Question</span></span>
        </span>
            <span class="inline-block">Bank</span>
        </h1>

        <p class="mx-auto mt-9 max-w-2xl text-lg tracking-tight text-gray-700 dark:text-gray-300 sm:mt-6">
            <span class="inline-block">Bring functionalities of other apps</span>
            <span class="inline-block">into your Notion workspaces.</span>
        </p>

        <div class="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div class="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                <a href="{{ route('questions.index') }}">
                    <x-button.secondary class="">Find Question</x-button.secondary>
                </a>
                <a href="{{ route('my-account.questions.create') }}">
                    <x-button.primary class=" text-white">Upload Question</x-button.primary>
                </a>
            </div>

        </div>

    </div>

    <div class="bg-white dark:bg-black ">

        <div class="container mx-auto px-2 py-14">
            <h3 class="text-center text-3xl font-marry font-semibold">Departments
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                @foreach($departments as $department)

                    <a href="{{route('questions.index',['department'=>$department->id])}}">
                        <x-card class="dark:bg-gray-900">
                            <h3 class="text-lg font-semibold">{{$department->full_name}}</h3>
                            {{ $department->questions_count }} Questions
                        </x-card>
                    </a>

                @endforeach
            </div>
            <p class="text-center text-gray-600 text-base mt-10">Want Your department here? <a href="{{ route('my-account.questions.create') }}"
                                                                                     title=""
                                                                                     class="font-medium text-blue-600 transition-all duration-200 hover:text-blue-700 focus:text-blue-700 hover:underline">Upload Question</a></p>
        </div>

    </div>

    <div class="container mx-auto px-2 py-10 space-y-6">
        <h3 class="text-center text-4xl font-marry font-semibold">Most Popular Questions
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 ">

            @foreach ($questions as $question)
                <x-question.question-list-item :question="$question" />
            @endforeach


        </div>
        @if ($questions->isEmpty())
            <p>No Question Found</p>
        @else
            <div class="flex justify-center">
                <a href="{{ route('questions.index') }}">
                    <x-button.primary>
                        View All
                    </x-button.primary>
                </a>
            </div>
        @endif
    </div>

</x-web-layout>
