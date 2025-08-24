<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Show the profile edit form.
     */
    public function edit()
    {
        $user = Auth::user();
        
        return view('profile.edit', compact('user'));
    }

    /**
     * Update the user's profile.
     */
    public function update(ProfileRequest $request)
    {
        $user = Auth::user();
        $updateData = $request->validated();
        

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            // Delete old image if it exists (extract the key from URL if it's a full URL)
            if ($user->image) {
                $oldImageKey = $this->extractS3KeyFromUrl($user->image);
                if ($oldImageKey && Storage::disk('s3')->exists($oldImageKey)) {
                    Storage::disk('s3')->delete($oldImageKey);
                }
            }
            
            // Generate new filename
            $uuid = Str::uuid();
            $extension = $request->file('image')->getClientOriginalExtension();
            $filename = "{$uuid}.{$extension}";
            
            // Store image to S3 with public visibility
            $path = Storage::disk('s3')->putFileAs(
                'profile-images',
                $request->file('image'),
                $filename,
                'public'
            );
            

            // Update the image path in update data
            $updateData['image'] = Storage::disk('s3')->url($path);
        } else {

            // Remove image from update data if no file uploaded to avoid overwriting existing value
            unset($updateData['image']);
        }
        
        $user->update($updateData);

        toast('Profile updated successfully! ✨', 'success');

        return redirect()->route('profile.edit');
    }

    /**
     * Extract S3 key from URL (for old images that might be stored as full URLs)
     */
    private function extractS3KeyFromUrl($url)
    {
        if (!$url) return null;
        
        // If it's already a key (doesn't start with http), return as is
        if (!str_starts_with($url, 'http')) {
            return $url;
        }
        
        // Extract key from S3 URL
        $bucket = config('filesystems.disks.s3.bucket');
        $region = config('filesystems.disks.s3.region');
        
        // Handle different S3 URL formats
        $patterns = [
            "/{$bucket}\.s3\.{$region}\.amazonaws\.com\/(.+)/",
            "/{$bucket}\.s3\.amazonaws\.com\/(.+)/", 
            "/s3\.{$region}\.amazonaws\.com\/{$bucket}\/(.+)/",
            "/s3\.amazonaws\.com\/{$bucket}\/(.+)/"
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
}
