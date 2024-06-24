<x-web-layout>

    <div class="container mx-auto px-2 py-20 space-y-3 ">

        <!-- This example requires Tailwind CSS v2.0+ -->
        <x-card class=" font-figtree relative">
            <div class=" absolute  top-0 right-0 flex  gap-2">
                @if (auth()->user()?->id == $question->user_id)
                    <a href="{{ route('my-account.questions.edit', $question) }}"
                       class="bg-primary-300 dark:bg-primary-500 rounded p-2 ">
                        <x-svg.edit class="w-5 h-5" />
                    </a>
                @endif
                @if (auth()->user()?->email == 'sourov2305101004@diu.edu.bd')
                    <a href="{{ route('filament.admin.resources.questions.edit', $question) }}"
                       class=" bg-primary-300 dark:bg-primary-500 rounded p-2 ">
                        <x-svg.edit class="w-5 h-5" />
                    </a>
                @endif
            </div>

            <div class="px-2 py-2 sm:px-6">
                <h3 class="text-lg leading-6 font-medium ">Question Information</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Question details and filter info.</p>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-500 px-2 py-2 sm:p-0">
                <dl class="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
                    <div class="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 ">Question name</dt>
                        <dd class="mt-1 text-lg  sm:mt-0 sm:col-span-2">{{ $question->title }}</dd>
                    </div>
                    <div class="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</dt>
                        <dd class="mt-1 text-sm  sm:mt-0 sm:col-span-2 flex flex-wrap gap-3">
                            @foreach ($question->departments as $department)
                                <x-badge class="bg-green-100 text-green-800">
                                    {{ $department->name }}
                                </x-badge>
                            @endforeach
                            @foreach ($question->semesters as $semester)
                                <x-badge class="bg-blue-100 text-blue-800">
                                    {{ $semester->name }}
                                </x-badge>
                            @endforeach

                            @foreach ($question->exam_types as $exat_type)
                                <x-badge class="bg-orange-100 text-orange-800">
                                    {{ $exat_type->name }}
                                </x-badge>
                            @endforeach
                            @foreach ($question->course_names as $course_code)
                                <x-badge class="bg-primary-100 text-primary-800">
                                    {{ $course_code->name }}
                                </x-badge>
                            @endforeach

                        </dd>
                    </div>

                    <div class="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By</dt>

                        <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2 font-marry font-semibold">


                            <a href="{{ route('contributors.show', $question->user) }}"
                               class=" flex items-center gap-2 p-1 rounded bg-slate-100 dark:bg-slate-900 w-fit px-4">
                                <img class="rounded-full shadow h-8 w-8"
                                     src="{{ $question->user->getMedia('profile-images')->last()?->getUrl() ?? asset('images/user.png') }}"
                                     alt="">
                                {{ $question->user->name }}</a>
                        </dd>
                    </div>

                </dl>
            </div>
        </x-card>

        <x-card class="space-y-5">
            <div class="flex gap-2 flex-wrap justify-center sm:justify-end">
                <p class=" md:hidden">Question not loading? <span id="reloadQuestionFrameButton"
                                                                  class=" cursor-pointer select-none">Click
                        Here</span>
                </p>
                <div class="flex flex-wrap gap-2">
                    <x-button.primary id="pdfMakeFullScreenButton" class=" text-sm">View Full Screen</x-button.primary>
                    <a href="{{ $question->getFirstMediaUrl('question-files') . '?uploader=' . urlencode($question->user->name) }}"
                       target="_blank">
                        <x-button.primary class=" text-sm">Download</x-button.primary>
                    </a>
                </div>


            </div>

            <object
                data="{{ $question->getFirstMediaUrl('question-files') . '?uploader=' . urlencode($question->user->name) }}"
                id="pdfviewerobject" type="application/pdf" width="100%" height="700px">
                <iframe id="pdfvieweriframe" width="100%" height="700px"
                        src="{{ route('questions.pdfviewer', $question) }}"></iframe>
            </object>


        </x-card>

        <livewire:question.question_comments :question="$question" />
    </div>
    <script>
        var pdfviewerobject = document.getElementById('pdfviewerobject');
        var pdfvieweriframe = document.getElementById('pdfvieweriframe');
        var button = document.getElementById('pdfMakeFullScreenButton');
        var reloadbutton = document.getElementById('reloadQuestionFrameButton');
        button.addEventListener('click', fullscreen);
        reloadbutton.addEventListener('click', reload);
        // when you are in fullscreen, ESC and F11 may not be trigger by keydown listener.
        // so don't use it to detect exit fullscreen
        document.addEventListener('keydown', function(e) {
            console.log('key press' + e.keyCode);
        });
        // detect enter or exit fullscreen mode
        document.addEventListener('webkitfullscreenchange', fullscreenChange);
        document.addEventListener('mozfullscreenchange', fullscreenChange);
        document.addEventListener('fullscreenchange', fullscreenChange);
        document.addEventListener('MSFullscreenChange', fullscreenChange);

        function fullscreen() {
            // check if fullscreen mode is available
            if (document.fullscreenEnabled ||
                document.webkitFullscreenEnabled ||
                document.mozFullScreenEnabled ||
                document.msFullscreenEnabled) {


                // Do fullscreen
                if (pdfviewerobject.requestFullscreen) {
                    pdfviewerobject.requestFullscreen();
                } else if (pdfviewerobject.webkitRequestFullscreen) {
                    pdfviewerobject.webkitRequestFullscreen();
                } else if (pdfviewerobject.mozRequestFullScreen) {
                    pdfviewerobject.mozRequestFullScreen();
                } else if (pdfviewerobject.msRequestFullscreen) {
                    pdfviewerobject.msRequestFullscreen();
                }
            } else {
                document.querySelector('.error').innerHTML = 'Your browser is not supported';
            }
        }

        function fullscreenChange() {
            if (document.fullscreenEnabled ||
                document.webkitIsFullScreen ||
                document.mozFullScreen ||
                document.msFullscreenElement) {
                console.log('enter fullscreen');
            } else {
                console.log('exit fullscreen');
            }
            // force to reload iframe once to prevent the iframe source didn't care about trying to resize the window
            // comment this line and you will see
            // var iframe = document.querySelector('iframe');
            // pdfviewerobject.src = pdfviewerobject.src;
        }

        function reload() {

            pdfvieweriframe.src = pdfvieweriframe.src;
        }
    </script>

</x-web-layout>
