<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class User extends Authenticatable implements FilamentUser, HasMedia, MustVerifyEmail
{
    use HasApiTokens;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    use InteractsWithMedia;

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->email === 'sourov2305101004@diu.edu.bd' && $this->hasVerifiedEmail();
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'student_id',
        'username',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the questions for the user.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('profile_picture')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
            ->useFallbackUrl(url: asset('images/fallback-user-image.png'))
            ->singleFile()
            ->useDisk(diskName: 'profile-pictures');
    }

    public function getRouteKeyName(): string
    {
        return 'username';
    }

    /**
     * Get the cached avatar URL for the user.
     */
    public function getAvatarUrlAttribute(): string
    {
        return cache()->remember(
            key: "user.{$this->id}.avatar",
            ttl: now()->addDay(),
            callback: fn () => $this->getFirstMediaUrl('profile_picture')
        );
    }
}
