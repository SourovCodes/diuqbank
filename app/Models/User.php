<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\UserRole;
use Filament\Panel;
use Laravel\Sanctum\HasApiTokens;
use RalphJSmit\Laravel\SEO\Support\HasSEO;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class User extends Authenticatable implements HasMedia
{

    use HasFactory, Notifiable,HasApiTokens;
    use InteractsWithMedia, SoftDeletes;
    use HasSEO;




    public function canAccessPanel(Panel $panel): bool
    {
        return ($this->email == 'sourov2305101004@diu.edu.bd' && $this->hasVerifiedEmail()) || $this->role == UserRole::admin;
        // return str_ends_with($this->email, '@yourdomain.com') && $this->hasVerifiedEmail();
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
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this
            ->addMediaConversion('preview')
            ->fit(Fit::Contain, 300, 300)
            ->queued();
    }

    public function getAvatarAttribute(): string
    {
        return $this->getFirstMediaUrl('avatar', 'preview');
    }

    public function questions(): User|HasMany
    {
        return $this->hasMany(Question::class);
    }
}
