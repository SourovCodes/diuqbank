<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Submission extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\SubmissionFactory> */
    use HasFactory;

    use InteractsWithMedia;

    public const string MEDIA_COLLECTION_PDF = 'pdf';

    public const int VOTE_UP = 1;

    public const int VOTE_DOWN = -1;

    /** @var array<int, string> */
    public const array QUESTION_RELATIONS = [
        'question.department',
        'question.course',
        'question.semester',
        'question.examType',
    ];

    protected $fillable = [
        'question_id',
        'user_id',
        'views',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(self::MEDIA_COLLECTION_PDF)
            ->singleFile()
            ->acceptsMimeTypes(['application/pdf']);
    }

    /**
     * Scope to include vote counts.
     */
    public function scopeWithVoteCounts(Builder $query): void
    {
        $query->withCount([
            'votes as upvotes_count' => fn ($q) => $q->where('value', self::VOTE_UP),
            'votes as downvotes_count' => fn ($q) => $q->where('value', self::VOTE_DOWN),
        ]);
    }

    /**
     * Load vote counts on the model.
     */
    public function loadVoteCounts(): self
    {
        return $this->loadCount([
            'votes as upvotes_count' => fn ($q) => $q->where('value', self::VOTE_UP),
            'votes as downvotes_count' => fn ($q) => $q->where('value', self::VOTE_DOWN),
        ]);
    }

    /**
     * @return BelongsTo<Question, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Vote, $this>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    public function getVoteScoreAttribute(): int
    {
        return $this->votes()->sum('value');
    }

    public function upvote(User $user): Vote
    {
        return $this->votes()->updateOrCreate(
            ['user_id' => $user->id],
            ['value' => self::VOTE_UP]
        );
    }

    public function downvote(User $user): Vote
    {
        return $this->votes()->updateOrCreate(
            ['user_id' => $user->id],
            ['value' => self::VOTE_DOWN]
        );
    }

    public function removeVote(User $user): bool
    {
        return $this->votes()->where('user_id', $user->id)->delete() > 0;
    }

    public function getUserVote(User $user): ?int
    {
        return $this->votes()->where('user_id', $user->id)->value('value');
    }

    public function incrementViews(): void
    {
        $this->increment('views', 1);
    }
}
