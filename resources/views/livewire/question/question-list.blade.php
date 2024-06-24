<div>

    <div class="container mx-auto px-2 py-10 space-y-6 ">
        <h3 class="text-center text-4xl font-marry font-semibold">All Questions
        </h3>
        <div>

            <form wire:submit.prevent="submit">
                {{ $this->form }}

            </form>


            @if ($qsearch)
                <p class="text-sm mt-1 text-gray-500">Showing Search Results for:<span> {{ $qsearch }}</span></p>
            @endif


        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            @if ($questions->isEmpty())
                <p>No Question Found</p>
            @endif
            @foreach ($questions as $question)
                <x-question.question-list-item :question="$question"/>
            @endforeach

        </div>
        <div wire:loading
             wire:target="course_name,semester,department,batch,exam_type,gotoPage,nextPage,previousPage,qsearch">
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-5">
                <div class="w-40 h-40 border-t-4 border-b-4 border-green-900 rounded-full animate-spin">
                </div>
            </div>
        </div>
        <div class="mt-2">
            {{ $questions->links('pagination.tailwind-livewire') }}

        </div>
    </div>


</div>
