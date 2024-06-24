<?php

namespace App\Livewire\Question;

use Livewire\Component;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use Filament\Forms\Form;
use App\Models\CourseName;
use App\Models\Department;
use Illuminate\Http\Request;
use Livewire\WithPagination;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Section;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Components\TextInput;
use Filament\Tables\Filters\SelectFilter;
use Filament\Forms\Concerns\InteractsWithForms;

class QuestionList extends Component implements HasForms
{

    use WithPagination;
    use InteractsWithForms;


    public $semester, $course_name, $department, $exam_type, $qsearch;

    protected $queryString = [
        'department',
        'semester',
        'course_name',
        'exam_type',
//        'qsearch' => ,

    ];
    public ?array $data = [];


    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Grid::make([
                    'default' => 2,
                    'sm' => 9,
//                    'md' => 3,
//                    'lg' => 4,
                ])
                    ->extraAttributes(['class' => 'gap-2'])
                    ->schema([
                        Select::make('course_name')
                            ->label('')
                            ->placeholder('Select Course')
                            ->columnSpan([
                                'default' => 2,
                                'sm' => 3,
//                                'md' => 3,
//                                'lg' => 4,
                            ])
                            ->options(
                                cache()->remember('course_name', 86400, function () {
                                    return CourseName::orderBy('name')->get()->pluck('name', 'id');
                                })
                            )
                            ->reactive()
                            ->searchable()
                            ->prefixIcon('heroicon-o-magnifying-glass')
                            ->afterStateUpdated(function ($state) {
                                $this->course_name = $state;
                                $this->resetPage();
                            }),


                        Select::make('department')
                            ->label('')
                            ->placeholder('Department')
                            ->columnSpan([
                                'default' => 1,
                                'sm' => 2,
//                                'md' => 3,
//                                'lg' => 4,
                            ])
                            ->searchable()
                            ->options(
                                cache()->remember('department', 86400, function () {
                                    return Department::all()->pluck('name', 'id');
                                })
                            )
                            ->reactive()
                            ->afterStateUpdated(function ($state) {
                                $this->department = $state;
                                $this->resetPage();
                            }),


                        Select::make('semester')
                            ->label('')
                            ->placeholder('Semester')
                            ->columnSpan([
                                'default' => 1,
                                'sm' => 2,
//                                'md' => 3,
//                                'lg' => 4,
                            ])
                            ->searchable()
                            ->options(
                                cache()->remember('semester', 86400, function () {
                                    return Semester::all()->pluck('name', 'id');
                                })
                            )
                            ->reactive()
                            ->afterStateUpdated(function ($state) {
                                $this->semester = $state;
                                $this->resetPage();
                            }),


                        Select::make('exam_type')
                            ->label('')
                            ->placeholder('Exam Type')
                            ->columnSpan([
                                'default' => 2,
                                'sm' => 2,
//                                'md' => 3,
//                                'lg' => 4,
                            ])
                            ->searchable()
                            ->options(
                                cache()->remember('exam_type', 86400, function () {
                                    return ExamType::all()->pluck('name', 'id');
                                })
                            )
                            ->reactive()
                            ->afterStateUpdated(function ($state) {
                                $this->exam_type = $state;
                                $this->resetPage();
                            }),


                        // TextInput::make('qsearch')
                        //     ->label("Question Title")
                        //     ->columnSpan(2)
                        //     ->placeholder("data structure")
                        //     ->prefixIcon('heroicon-o-rocket-launch')
                        //     ->debounce(300)

                        //     ->afterStateUpdated(function ($state) {
                        //         $this->qsearch = $state;
                        //         $this->resetPage();
                        //     }),

                    ])
            ]);
    }




    public function render()
    {

        $filter = new class ($this->semester, $this->course_name, $this->department, $this->exam_type, $this->qsearch) {
            public $semester;
            public $course_name;
            public $department;
            public $exam_type;
            public $qsearch;

            public function __construct($semester, $course_name, $department, $exam_type, $qsearch)
            {
                $this->semester = $semester;
                $this->course_name = $course_name;
                $this->department = $department;
                $this->exam_type = $exam_type;
                $this->qsearch = $qsearch;
            }
        };


        $questions = Question::with(['course_names', 'semesters', 'departments', 'exam_types'])->filter($filter);


        $cacheKey = $this->qsearch . "+" . $this->department . "+" . $this->semester . "+" . $this->course_name . "+" . $this->exam_type . "+" . $this->getPage();

        return view('livewire.question.question-list', [
            // 'questions' => $questions->latest()->paginate(10),
            'questions' => cache()->remember($cacheKey, now()->addHours(2), function () use ($questions) {
                return $questions->latest()->paginate(10);
            }),

        ]);
    }

    function resetFilter()
    {
        $this->semester = '';
        $this->course_name = '';
        $this->department = '';
        $this->exam_type = '';
        $this->qsearch = '';
        $this->resetPage();
    }

    function searchTitle()
    {
        // dd($this->qsearch);
    }
}
