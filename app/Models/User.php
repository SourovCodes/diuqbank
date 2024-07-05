<?php

namespace App\Models;

use App\Enums\UserRole;
use Filament\Panel;
use RalphJSmit\Laravel\SEO\Support\HasSEO;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Illuminate\Notifications\Notifiable;
use Filament\Models\Contracts\FilamentUser;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Sitemap\Contracts\Sitemapable;
use Spatie\Sitemap\Tags\Url;


class User extends Authenticatable implements HasMedia, MustVerifyEmail, FilamentUser,Sitemapable
{
    use HasFactory, Notifiable;
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
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'student_id',
        'phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
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

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('profile-images')
            ->useFallbackUrl(asset('images/user.png'))
            ->useFallbackPath(public_path('/images/user.png'));
        $this
            ->addMediaCollection('cover-photos')
            ->useFallbackUrl(asset('images/def_cover.jpg'))
            ->useFallbackPath(public_path('images/def_cover.jpg'));
    }
    public function registerMediaConversions(Media|null $media = null): void
    {
        $this
            ->addMediaConversion('preview')
            ->fit(Fit::Crop, 300, 300)
            ->queued();
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function getDynamicSEOData()
    {

        return new \RalphJSmit\Laravel\SEO\Support\SEOData(
            title: $this->name,
            description: "Name: $this->name | Email: $this->email | ID: $this->student_id ",
            author: $this->name,
            image: $this->getFirstMediaUrl('profile-images'),
        );
    }

    public function toSitemapTag(): Url|string|array
    {
        // Return with fine-grained control:
        return Url::create(route('contributors.show', $this))
            ->setLastModificationDate(\Carbon\Carbon::create($this->updated_at))
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY);

    }


}
