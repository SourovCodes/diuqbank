<?php

namespace App\Livewire\Question;

use App\Models\Comment;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Livewire\Component;
use App\Models\Question;
use Filament\Forms\Form;
use Filament\Actions\Action;
use Illuminate\Contracts\View\View;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Components\TextInput;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Actions\Concerns\InteractsWithActions;
use Livewire\WithPagination;




class QuestionComments extends Component implements HasForms, HasActions
{

    use InteractsWithForms;
    use InteractsWithActions;
    use WithPagination;


    public Question $question;
    public ?array $data = [];

    public function mount(Question $question): void
    {
        $this->question = $question;
        $this->form->fill();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([

                Textarea::make('body')
                    ->label("Make a Comment")
                    ->rows(4)
                    ->required()

                // ...
            ])
            ->model(Question::class)
            ->statePath('data');
    }

    public function create()
    {
        if (!auth()->user()) {

            Notification::make()
                ->title("You Must Be logged in to make a comment")
                ->warning()
                ->send();
            return redirect(route('login'));
        }
        $this->validate();
        $this->question->comments()->create(array_merge($this->form->getState(), [
            'user_id' => auth()->user()->id,
        ]));
        $this->reset('data');
    }

    public function deleteAction(): Action
    {
        return Action::make('delete')
            ->requiresConfirmation()
            ->icon('heroicon-o-trash')
            ->iconButton()
            ->action(function (array $arguments) {
                $comment = Comment::findOrFail($arguments['comment']);
                $comment->delete();
                Notification::make()
                    ->title("comment deleted")
                    ->success()
                    ->send();
            });
    }
    public function replyAction(): Action
    {
        return Action::make('reply')
            ->form([
                Textarea::make('body')
                    ->label('make a reply')
                    ->rows(3)
                    ->required()
            ])
            // ->requiresConfirmation()
            ->icon('heroicon-o-chat-bubble-left-ellipsis')
            ->iconButton()

            ->action(function (array $arguments, array $data) {
                if (!auth()->user()) {

                    Notification::make()
                        ->title("You Must Be logged in to make a comment")
                        ->warning()
                        ->send();
                    return redirect(route('login'));
                }
                $newReply = $this->question->comments()->create(array_merge($data, [
                    'user_id' => auth()->user()->id,
                    'parent_id' => $arguments['parent_id'] ?? null,
                ]));
                Notification::make()
                    ->title("Reply Submitted")
                    ->success()
                    ->send();

            });
    }

    public function render()
    {
        $comments = $this->question->comments()->latest()->paginate(30);
        // dd($comments->toArray());
        return view('livewire.question.question-comments', compact('comments'));
    }
}
