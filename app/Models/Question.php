<?php

namespace App\Models;


use Filament\Forms\Components\Select;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;

use Filament\Forms\Components\Section;
use Illuminate\Database\Eloquent\Model;
use Filament\Forms\Components\TextInput;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;

class Question extends Model implements HasMedia
{
    use InteractsWithMedia;

    use HasFactory, SoftDeletes;


    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',

    ];

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('question-files')
            ->useFallbackUrl(asset('images/user.png'))
            ->useFallbackPath(public_path('/images/user.png'));

    }
    public function scopeFilter($query, $request)
    {



        if ($request->course_name && $request->course_name != 'all') {
            $query->whereHas('course_names', function ($query) use ($request) {
                $query->whereIn('course_name_id', [$request->course_name]);
            });
        }

        if ($request->semester && $request->semester != 'all') {

            $query->whereHas('semesters', function ($query) use ($request) {
                $query->whereIn('semester_id', [$request->semester]);
            });
        }
        if ($request->department && $request->department != 'all') {
            $query->whereHas('departments', function ($query) use ($request) {
                $query->whereIn('department_id', [$request->department]);
            });
        }
        if ($request->batch && $request->batch != 'all') {
            $query->whereHas('batches', function ($query) use ($request) {
                $query->whereIn('batch_id', [$request->batch]);
            });
        }
        if ($request->exam_type && $request->exam_type != 'all') {
            $query->whereHas('exam_types', function ($query) use ($request) {
                $query->whereIn('exam_type_id', [$request->exam_type]);
            });
        }
        if ($request->qsearch) {
            $searchText = $request->qsearch;

            $query->where(function ($query) use ($searchText) {

                $query->where('title', 'like', "%$searchText%")
                    ->orWhereHas('course_names', function ($query) use ($searchText) {
                        $query->where('name', 'like', '%' . $searchText . '%');
                    });
            });
        }


    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function comments()
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id')->with(['user.media', 'replies.user.media'])->withTrashed();
    }

    public function semesters()
    {
        return $this->belongsToMany(Semester::class);
    }
    public function departments()
    {
        return $this->belongsToMany(Department::class);
    }



    public function course_names()
    {
        return $this->belongsToMany(CourseName::class);
    }

    public function exam_types(): BelongsToMany
    {
        return $this->belongsToMany(ExamType::class);
    }




    public static function getForm(): array
    {
        return [
            // Select::make('user_id')
            //     ->relationship('user', 'name')
            //     ->nullable(false)
            //     ->default(auth()->id()),

            Section::make('Submit Question')
                ->columns(2)

                ->description('Please try to be responsible')
                ->schema([
                    TextInput::make('title')
                        ->placeholder("Data structure Fall 23 Final 'or' Fall 23 Final all questions CSE 65")
                        ->required()
                        ->maxLength(255)
                        ->live()
                        ->debounce()
                        ->columnSpanFull()
                    ,
                    SpatieMediaLibraryFileUpload::make('Question file')
                        ->hint("upload pdf")

                        ->collection('question-files')
                        ->disk('questions')
                        ->preserveFilenames()
                        ->acceptedFileTypes(['application/pdf'])

                        ->visibility('public')
                        ->required(),





                    Select::make('departments')
                        ->relationship('departments', 'name')
                        ->createOptionModalHeading("Add New Department")
                        ->createOptionForm(Department::getForm())
                        ->required()
                        ->preload(),

                    Select::make('semesters')
                        ->relationship('semesters', 'name')
                        ->createOptionModalHeading("Add New Semester")
                        ->createOptionForm(Semester::getForm())
                        ->required()
                        ->preload(),

                    Select::make('course_names')
                        ->relationship('course_names', 'name')
                        ->createOptionModalHeading("Add New Course Name")
                        ->createOptionForm(CourseName::getForm())
                        ->required()
                        ->preload(),
                    Select::make('exam_types')
                        ->relationship('exam_types', 'name')
                        ->createOptionModalHeading("Add New Exam Type")
                        ->createOptionForm(ExamType::getForm())
                        ->required()
                        ->preload(),

                ])

        ];
    }

}
