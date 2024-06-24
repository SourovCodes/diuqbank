<?php

namespace App\Livewire\Question;


use Filament\Notifications\Notification;
use Livewire\Component;
use App\Models\Question;
use Filament\Forms\Form;
use Illuminate\Contracts\View\View;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Concerns\InteractsWithForms;
use Livewire\WithPagination;

class SubmitQuestion extends Component implements HasForms
{
    use InteractsWithForms;
    use WithPagination;

    public ?array $data = [];
    public Question $record;
    public $warningMessage = null;
    private $duplicateCheckquery;


    public function mount(Question $question): void
    {
        $this->record = $question;
        $this->form->fill($question->attributesToArray());
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema(
                Question::getForm()
            )->statePath('data')
            ->model($this->record);
    }




    public function checkForDuplicateQuestion(): void
    {
        $query = Question::whereHas('departments', function ($q) {
            $q->whereIn('department_id', [$this->data['departments']] ?? []);
        }, '=', count([$this->data['departments']] ?? []))
            ->whereHas('semesters', function ($q) {
                $q->whereIn('semester_id', $this->data['semesters'] ?? []);
            }, '=', count($this->data['semesters'] ?? []))

            ->whereHas('course_names', function ($q) {
                $q->whereIn('course_name_id', $this->data['course_names'] ?? []);
            }, '=', count($this->data['course_names'] ?? []))
            ->whereHas('exam_types', function ($q) {
                $q->whereIn('exam_type_id', $this->data['exam_types'] ?? []);
            }, '=', count($this->data['exam_types'] ?? []))->whereNot('id', $this->record->id ?? 0);

        $exists = $query->exists();


        if ($exists) {
            $this->duplicateCheckquery = $query;
            $this->warningMessage = 'Question with the same configuration already exists.';
        } else {
            $this->warningMessage = null;
        }
    }

    public function create(): void
    {
        $this->form->validate();
        $this->checkForDuplicateQuestion();
        // Check for existing question
        if ($this->warningMessage) {
            // dd($this->duplicateCheckquery->paginate(10));
            Notification::make()
                ->title($this->warningMessage)
                ->warning()
                ->send();
            return;
        }
        $this->saveAfterConfirmation();


    }
    public function saveAfterConfirmation(): void
    {
        $shouldRedirect = $this->record->id ? false : true;
        $data = $this->form->getState();

        $this->record->fill(array_merge($data, [
            'user_id' => auth()->user()->id,
        ]));

        $this->record->save();
        $this->form->model($this->record)->saveRelationships();
        $this->form->fill($this->record->attributesToArray());
        Notification::make()
            ->title('Question Saved')
            ->success()
            ->send();

        cache()->flush();
        $this->redirect(route('questions.show', $this->record));

    }

    public function render(): View
    {
        return view('livewire.question.submit-question', [
            'existingQuestions' => $this->duplicateCheckquery?->take(10)->get() ?? [],
        ]);
    }
}
