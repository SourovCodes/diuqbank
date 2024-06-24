<x-card class="space-y-2 relative p-4 sm:p-5">
    <a href="{{ route('questions.show', $question) }}">
        <h3 class=" font-marry font-semibold text-lg line-clamp-2">{{ $question->title }}
        </h3>
    </a>

    <div class="tags flex gap-2 flex-wrap">
        @foreach ($question->departments as $department)
            <x-badge class="bg-green-100 text-green-800">
                {{ $department->name }}
            </x-badge>
        @endforeach
        @php
            $count = count($question->course_names);
        @endphp
        @if ($count)
            <x-badge class="bg-primary-100 text-primary-800 {{$count>1?' border-2 border-danger-500 border-dashed ':''}}">
                {{ $question->course_names[0]->name }}
                @if ($count > 1)
                    + {{ $count - 1 }} more.
                @endif
            </x-badge>
        @endif

        @php
            $count = count($question->semesters);
        @endphp
        @if ($count)
            <x-badge class="bg-blue-100 text-blue-800 {{$count>1?' border-2 border-danger-500 border-dashed ':''}} ">
                {{ $question->semesters[0]->name }}
                @if ($count > 1)
                    + {{ $count - 1 }} more.
                @endif
            </x-badge>
        @endif


        @foreach ($question->exam_types as $exam_type)
            <x-badge class="bg-gray-100 text-gray-800">
                {{ $exam_type->name }}
            </x-badge>
        @endforeach

    </div>

    <div class="">
        <a href="{{ route('questions.show', $question) }}" class=" text-primary-500">
            See more
        </a>

    </div>
    @if (auth()->user()?->id == $question->user_id)
        <a href="{{ route('my-account.questions.edit', $question) }}"
           class=" absolute  -top-3 right-0 bg-primary-300 dark:bg-primary-500 rounded p-2 ">
            <x-svg.edit class="w-5 h-5"/>
        </a>
    @endif

</x-card>
