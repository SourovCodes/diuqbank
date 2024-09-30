<div>
    <div class="container mx-auto px-2 py-10">
        <form wire:submit="create">
            {{ $this->form }}



        </form>







        @if ($warningMessage)
            <x-button.secondary class="mt-4" wire:click="checkForDuplicateQuestion">
                Recheck
            </x-button.secondary>
            <x-button.danger class="mt-4" wire:click="saveAfterConfirmation">
                ok, but still Update
            </x-button.danger>
            <p class="mt-5 w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                {{ $warningMessage }} </p>
                <p class="mt-2 w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-300 text-yellow-800">
                    {{ $warningMessageBn }} </p>
            <div class="grid grid-cols-1 md:grid-cols-2 mt-2 gap-5">
                @foreach ($existingQuestions as $question)
                    <a href="{{ route('questions.show', $question) }}" target="_blank">
                        <x-auth.card class="border border-primary-500">
                            {{ $question->title }}
                        </x-auth.card>
                    </a>
                @endforeach
            </div>
        @else
            <x-button.primary wire:click="create" class="mt-4">
                Save
            </x-button.primary>
        @endif


    </div>


    <x-filament-actions::modals />
    <div wire:loading wire:target="create,checkForDuplicateQuestion,saveAfterConfirmation">
        <div
            class="fixed z-40 flex tems-center justify-center inset-0 bg-gray-700 dark:bg-gray-900 dark:bg-opacity-50 bg-opacity-50 transition-opacity">
            <div class="flex items-center justify-center ">
                <div class="w-40 h-40 border-t-4 border-b-4 border-green-900 rounded-full animate-spin">
                </div>
            </div>
        </div>
    </div>

</div>
