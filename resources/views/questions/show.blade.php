<x-web-layout>

	@section('seo')
		{!! seo($SEOData) !!}
	@endsection

	<!-- Blog Article -->
	<div class="container px-2 mx-auto">
		<div class="">
			<div class="py-8">
				<div class="space-y-5 lg:space-y-8 relative">

					<div class=" absolute  top-0 right-0 flex  gap-2">
						@if (auth()->user()?->id == $question->user_id)
							<a href="{{ route('my-account.questions.edit', $question) }}"
							   class="bg-primary-300 dark:bg-primary-500 rounded p-2 ">
								<x-svg.edit class="w-5 h-5"/>
							</a>
						@endif
						@if (auth()->user()?->email == 'sourov2305101004@diu.edu.bd')
							<a href="{{ route('filament.admin.resources.questions.edit', $question) }}"
							   class=" bg-primary-300 dark:bg-primary-500 rounded p-2 ">
								<x-svg.edit class="w-5 h-5"/>
							</a>
						@endif
					</div>

					<h2 class="text-3xl font-bold lg:text-5xl dark:text-white">{{ $question->title }}</h2>

					<div class="flex items-center gap-2 flex-wrap ">
						<a href="{{ route('contributors.show', $question->user) }}"
						   class=" flex items-center gap-2 p-1 rounded-full bg-gray-100 dark:bg-gray-900 w-fit px-4">
							<img class="rounded-full shadow h-8 w-8"
							     src="{{ $question->user->getMedia('profile-images')->last()?->getUrl() ?? asset('images/user.png') }}"
							     alt="">
							{{ $question->user->name }}</a>

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
					</div>
					<div class="flex gap-2 flex-wrap justify-center sm:justify-end">
						<p class=" md:hidden">Question not loading? <span id="reloadQuestionFrameButton"
						                                                  class=" cursor-pointer select-none">Click
                        Here</span>
						</p>
						<div class="flex flex-wrap gap-2">
							<x-button.primary id="pdfMakeFullScreenButton" class=" text-sm">View Full Screen
							</x-button.primary>
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
						        src="{{ route('questions.pdfviewer', $question) }}" frameborder="0"></iframe>
					</object>

					<div class="grid lg:flex lg:justify-between lg:items-center gap-y-5 lg:gap-y-0">
						<!-- Badges/Tags -->
						<div>
							<p class="text-xs sm:text-sm text-gray-800 dark:text-neutral-200">{{$question->created_at->format('M d,Y')}}</p>
						</div>
						<!-- End Badges/Tags -->

						<div class="flex justify-end items-center gap-x-1.5">
							<!-- Button -->
							<div class="hs-tooltip inline-block">
								<button type="button"
								        class="hs-tooltip-toggle flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200">
									<x-svg.eye class="w-5 h-5"/>
									{{$question->view_count}}
									<span
											class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm dark:bg-black"
											role="tooltip"> Views </span>
								</button>
							</div>
							<!-- Button -->

							<div class="block h-3 border-e border-gray-300 mx-3 dark:border-neutral-600"></div>

							<!-- Button -->
							<div class="hs-tooltip inline-block">
								<button type="button"
								        class="hs-tooltip-toggle flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200">
									<x-svg.comments class="w-5 h-5"/>
									{{$question->comments_count}}
									<span
											class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm dark:bg-black"
											role="tooltip">
                    Comment
                  </span>
								</button>
							</div>
							<!-- Button -->

							{{--                            <div class="block h-3 border-e border-gray-300 mx-3 dark:border-neutral-600"></div>--}}

							{{--                            <!-- Button -->--}}
							{{--                            <div class="hs-dropdown relative inline-flex">--}}
							{{--                                <button type="button" id="blog-article-share-dropdown"--}}
							{{--                                        class="hs-dropdown-toggle flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200">--}}
							{{--                                    <x-svg.share class="w-5 h-5" />--}}
							{{--                                    Share--}}
							{{--                                </button>--}}
							{{--                                <div--}}
							{{--                                    class="hs-dropdown-menu w-56 transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden mb-1 z-10 bg-gray-900 shadow-md rounded-xl p-2 dark:bg-black"--}}
							{{--                                    aria-labelledby="blog-article-share-dropdown">--}}
							{{--                                    <a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-400 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:focus:ring-neutral-400"--}}
							{{--                                       href="#">--}}
							{{--                                        <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24"--}}
							{{--                                             height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"--}}
							{{--                                             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">--}}
							{{--                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>--}}
							{{--                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>--}}
							{{--                                        </svg>--}}
							{{--                                        Copy link--}}
							{{--                                    </a>--}}
							{{--                                    <div class="border-t border-gray-600 my-2 dark:border-neutral-800"></div>--}}
							{{--                                    <a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-400 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:focus:ring-neutral-400"--}}
							{{--                                       href="#">--}}
							{{--                                        <x-svg.twitter class="w-5 h-5" />--}}
							{{--                                        Share on Twitter--}}
							{{--                                    </a>--}}
							{{--                                    <a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-400 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:focus:ring-neutral-400"--}}
							{{--                                       href="#">--}}
							{{--                                        <x-svg.facebook class="w-5 h-5" />--}}
							{{--                                        Share on Facebook--}}
							{{--                                    </a>--}}
							{{--                                    <a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-400 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:focus:ring-neutral-400"--}}
							{{--                                       href="#">--}}
							{{--                                        <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="16"--}}
							{{--                                             height="16" fill="currentColor" viewBox="0 0 16 16">--}}
							{{--                                            <path--}}
							{{--                                                d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>--}}
							{{--                                        </svg>--}}
							{{--                                        Share on LinkedIn--}}
							{{--                                    </a>--}}
							{{--                                </div>--}}
							{{--                            </div>--}}
							{{--                            <!-- Button -->--}}
						</div>
					</div>
					@production
						<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5256137078683241"
						        crossorigin="anonymous"></script>
						<ins class="adsbygoogle"
						     style="display:block"
						     data-ad-format="autorelaxed"
						     data-ad-client="ca-pub-5256137078683241"
						     data-ad-slot="2792441680"></ins>
						<script>
                            (adsbygoogle = window.adsbygoogle || []).push({});
						</script>
					@endproduction
					<livewire:question.question_comments :question="$question"/>


				</div>

			</div>
		</div>

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
        document.addEventListener('keydown', function (e) {
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
