@extends('layouts.app')

@section('title', 'Edit Profile')

@section('content')
<!-- Add Cropper.js CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css">
<!-- Add Cropper.js JavaScript -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js"></script>
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">Edit Profile</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">Update your profile information</p>
    </div>

    <div class="w-full">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl overflow-hidden">
            <form method="POST" action="{{ route('profile.update') }}" enctype="multipart/form-data" class="p-4 sm:p-6 space-y-6">
                @csrf
                @method('PUT')

                <!-- Profile Image Upload -->
                <div class="space-y-4">
                    <div class="text-center sm:text-left">
                        <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">Profile Picture</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Upload and crop your profile image</p>
                    </div>
                    
                    <!-- Mobile-First Layout -->
                    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                        <!-- Image Preview -->
                        <div class="flex-shrink-0">
                            <div class="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-2xl sm:text-3xl font-semibold shadow-lg">
                                <img id="preview-image" src="{{ $user->image ?? '' }}" alt="{{ $user->name }}" class="h-full w-full object-cover {{ empty($user->image) ? 'hidden' : '' }}" />
                                <span id="preview-initials" class="{{ !empty($user->image) ? 'hidden' : '' }}">{{ collect(explode(' ', trim($user->name ?? 'U')))->filter()->map(fn($w) => mb_substr($w,0,1))->join('') }}</span>
                            </div>
                        </div>
                        
                        <!-- Upload Controls -->
                        <div class="flex-1 w-full space-y-3 text-center sm:text-left">
                            <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                                <label for="image-upload" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer transition-colors shadow-sm w-full sm:w-auto">
                                    <x-lucide-upload class="h-4 w-4" />
                                    Choose Image
                                </label>
                                <div class="text-xs text-slate-500 dark:text-slate-400">
                                    <div>Max: 10MB → 1000×1000px</div>
                                </div>
                            </div>
                            
                            <div class="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                <div class="flex items-center justify-center sm:justify-start gap-1">
                                    <x-lucide-check class="h-3 w-3 text-green-500 flex-shrink-0" />
                                    <span>JPEG, PNG, WebP supported</span>
                                </div>
                                <div class="flex items-center justify-center sm:justify-start gap-1">
                                    <x-lucide-scissors class="h-3 w-3 text-blue-500 flex-shrink-0" />
                                    <span>Built-in cropping tool</span>
                                </div>
                            </div>
                            
                            <input type="file" id="image-upload" name="image" accept="image/*" class="hidden" />
                        </div>
                    </div>
                    
                    @error('image')
                        <div class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                            <p class="text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                        </div>
                    @enderror
                </div>

                <!-- Personal Information Section -->
                <div class="space-y-4">
                    <div class="text-center sm:text-left">
                        <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">Personal Information</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Update your personal details</p>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- Name -->
                        <div>
                            <label for="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Full Name <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value="{{ old('name', $user->name) }}"
                                required
                                class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors @error('name') border-red-500 focus:border-red-500 focus:ring-red-500/20 @enderror"
                                placeholder="Enter your full name"
                            />
                            @error('name')
                                <p class="mt-2 text-xs text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Username -->
                        <div>
                            <label for="username" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Username <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                value="{{ old('username', $user->username) }}"
                                required
                                class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors @error('username') border-red-500 focus:border-red-500 focus:ring-red-500/20 @enderror"
                                placeholder="Enter your username"
                            />
                            <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">Only letters, numbers, dashes, and underscores</p>
                            @error('username')
                                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Email (Read-only) -->
                        <div>
                            <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email Address
                                <span class="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                    <x-lucide-lock class="h-3 w-3" />
                                    Read-only
                                </span>
                            </label>
                            <input 
                                type="email" 
                                id="email" 
                                value="{{ $user->email }}"
                                readonly
                                disabled
                                class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed"
                            />
                            <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">Linked to your DIU account</p>
                        </div>

                        <!-- Student ID -->
                        <div>
                            <label for="student_id" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Student ID
                                <span class="text-slate-500 text-xs font-normal">(Optional)</span>
                            </label>
                            <input 
                                type="text" 
                                id="student_id" 
                                name="student_id" 
                                value="{{ old('student_id', $user->student_id) }}"
                                class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors @error('student_id') border-red-500 focus:border-red-500 focus:ring-red-500/20 @enderror"
                                placeholder="Enter your student ID"
                            />
                            @error('student_id')
                                <p class="mt-2 text-xs text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>



                <!-- Action Buttons -->
                <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <!-- Mobile: Stack vertically, Desktop: Side by side -->
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div class="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <x-lucide-info class="h-3 w-3 flex-shrink-0" />
                            <span>Fields marked with <span class="text-red-500">*</span> are required</span>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
                            <a href="{{ auth()->user() ? route('contributors.show', auth()->user()->username) : route('home') }}" class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <x-lucide-arrow-left class="h-4 w-4" />
                                Cancel
                            </a>
                            
                            <button type="submit" class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow">
                                <x-lucide-save class="h-4 w-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <!-- Account Information -->
        <div class="mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl overflow-hidden">
            <div class="p-4 sm:p-6">
                <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center sm:text-left">Account Information</h3>
                <div class="space-y-3 text-sm">
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span class="text-slate-600 dark:text-slate-400 font-medium sm:font-normal">Email Verified:</span>
                        <span class="text-slate-900 dark:text-white">
                            @if($user->email_verified_at)
                                <span class="inline-flex items-center gap-1 text-green-600">
                                    <x-lucide-check-circle class="h-4 w-4" />
                                    Verified
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1 text-amber-600">
                                    <x-lucide-alert-circle class="h-4 w-4" />
                                    Not verified
                                </span>
                            @endif
                        </span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span class="text-slate-600 dark:text-slate-400 font-medium sm:font-normal">Member Since:</span>
                        <span class="text-slate-900 dark:text-white">{{ $user->created_at->format('M j, Y') }}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span class="text-slate-600 dark:text-slate-400 font-medium sm:font-normal">Total Questions:</span>
                        <span class="text-slate-900 dark:text-white">{{ $user->questions()->count() }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Image Crop Modal -->
<div id="crop-modal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
    <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-800 shadow-xl mx-4">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Crop Your Image</h3>
                <button id="cancel-crop-btn" type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                    <x-lucide-x class="h-5 w-5" />
                </button>
            </div>
            
            <div class="p-4 sm:p-6">
                <div class="mb-4">
                    <div class="relative h-64 sm:h-80 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                        <img id="crop-image" src="" alt="Crop preview" class="max-w-full h-full object-contain" />
                    </div>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p class="text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
                        Drag to move, resize corners to adjust
                    </p>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <button id="cancel-crop-btn" type="button" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Cancel
                        </button>
                        <button id="crop-btn" type="button" class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors">
                            <x-lucide-crop class="h-4 w-4" />
                            Crop Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@vite(['resources/js/profile-image.js'])

<script>
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action="{{ route('profile.update') }}"]');
    const fileInput = document.getElementById('image-upload');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Check if we have a cropped file
            if (fileInput && fileInput.croppedFile) {
                // Prevent default form submission
                e.preventDefault();
                
                // Create a new FormData with the cropped file
                const formData = new FormData(form);
                
                // Remove the original file and add the cropped one
                formData.delete('image');
                formData.append('image', fileInput.croppedFile, fileInput.croppedFile.name);
                
                // Submit using fetch
                fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                })
                .then(response => {
                    if (response.ok) {
                        window.location.reload();
                    } else {
                        if (window.toast && window.toast.error) {
                            window.toast.error('Failed to update profile. Please try again.');
                        }
                    }
                })
                .catch(error => {
                    if (window.toast && window.toast.error) {
                        window.toast.error('An error occurred. Please try again.');
                    }
                });
                
                return false;
            }
        });
    }
});
</script>
@endsection
