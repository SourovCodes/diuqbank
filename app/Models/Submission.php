<?php

namespace App\Models;

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

    protected $fillable = [
        'question_id',
        'user_id',
        'section',
        'views',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('pdf')
            ->singleFile()
            ->acceptsMimeTypes(['application/pdf']);
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
            ['value' => 1]
        );
    }

    public function downvote(User $user): Vote
    {
        return $this->votes()->updateOrCreate(
            ['user_id' => $user->id],
            ['value' => -1]
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
