<?php
	
	namespace App\Http\Controllers;
	
	use App\Models\Question;
	use App\Models\User;
	use Illuminate\Http\Request;
	
	class ContributorController extends Controller
	{
		/**
		 * Display a listing of the resource.
		 */
		public function index()
		{
			$contributors = cache()->remember('contributors', 3600, function () {
				return User::with('media')
					->withCount('questions')
					->having('questions_count', '>', 0)
					->orderByDesc('questions_count')
					->get();
			});
			
			
			return view('contributors.index', compact('contributors'));
		}
		
		/**
		 * Display the specified resource.
		 */
		public function show(User $user)
		{
			
			$questions = cache()->remember($user->id . '-questions-' . request()->get('page') ?? '1', 60, function () use ($user) {
				return Question::where('user_id', $user->id)->with(['departments', 'semesters', 'course_names', 'exam_types'])->latest()->paginate(6);
			});
			
			return view('contributors.show', compact('user', 'questions'));
		}
		
		public function profile(Request $request)
		{
			$user = $request->user();
			$questions = cache()->remember($user->id . '-profile-' . request()->get('page') ?? '1', 60, function () use ($user) {
				return Question::where('user_id', $user->id)->with(['departments', 'semesters', 'course_names', 'exam_types'])->latest()->paginate(6);
			});
			
			return view('contributors.show', compact('user', 'questions'));
		}
		
	}
