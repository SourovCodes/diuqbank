import { ImageCropper } from '@/components/image-cropper';
import PageHeader from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MainLayout from '@/layouts/main-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Camera, Loader2, Save, User as UserIcon } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    student_id: string | null;
    avatar: string;
}

interface ProfileEditProps {
    user: User;
}

type ProfileFormData = {
    name: string;
    username: string;
    student_id: string;
} & Record<string, string>;

export default function ProfileEdit({ user }: ProfileEditProps) {
    const [showImageCropper, setShowImageCropper] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState<string>(user.avatar);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const { data, setData, put, processing, errors } = useForm<ProfileFormData>({
        name: user.name || '',
        username: user.username || '',
        student_id: user.student_id || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        put('/profile', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile updated successfully!');
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                errorMessages.forEach((error) => {
                    toast.error(error as string);
                });
            },
        });
    };

    const handleImageComplete = async (croppedImageFile: File) => {
        setShowImageCropper(false);
        setIsUploadingImage(true);

        // Create FormData to send the file
        const formData = new FormData();
        formData.append('avatar', croppedImageFile);

        router.post('/profile/image', formData, {
            preserveScroll: true,
            forceFormData: true, // Ensure Inertia sends as multipart/form-data
            onSuccess: (page) => {
                // Update preview with the new avatar URL from the response
                const pageProps = page.props as { user?: User };
                const newAvatar = pageProps.user?.avatar;
                if (newAvatar) {
                    setPreviewAvatar(newAvatar);
                }
                setIsUploadingImage(false);
                toast.success('Profile picture updated successfully!');
            },
            onError: (errors) => {
                setIsUploadingImage(false);
                const errorMessages = Object.values(errors).flat();
                if (errorMessages.length > 0) {
                    errorMessages.forEach((error) => {
                        toast.error(error as string);
                    });
                } else {
                    toast.error('Failed to update profile picture');
                }
            },
            onFinish: () => {
                setIsUploadingImage(false);
            },
        });
    };

    const getInitials = (name?: string) => {
        return (
            name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'U'
        );
    };

    return (
        <MainLayout>
            <Head title="Edit Profile" />

            <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <PageHeader title="Edit" gradientText="Profile" description="Update your personal information and profile picture" />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md lg:col-span-2 dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Profile Picture Section */}
                                {/* Profile Picture Section */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24 border-4 border-slate-200 dark:border-slate-700">
                                            <AvatarImage src={previewAvatar} alt={data.name} />
                                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-500 text-2xl text-white">
                                                {getInitials(data.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            className="absolute right-0 bottom-0 h-8 w-8 rounded-full p-0 shadow-lg"
                                            onClick={() => setShowImageCropper(true)}
                                            disabled={isUploadingImage}
                                        >
                                            {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Click the camera icon to update your profile picture</p>
                                </div>

                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter your full name"
                                        className={errors.name ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                {/* Email Field - Read Only */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user.email}
                                        readOnly
                                        className="cursor-not-allowed bg-slate-50 dark:bg-slate-900/50"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Email cannot be changed</p>
                                </div>

                                {/* Username Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-sm font-medium">
                                        Username <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Enter your username"
                                        className={errors.username ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Only letters, numbers, dashes, and underscores allowed
                                    </p>
                                </div>

                                {/* Student ID Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="student_id" className="text-sm font-medium">
                                        Student ID
                                    </Label>
                                    <Input
                                        id="student_id"
                                        type="text"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        placeholder="Enter your student ID (optional)"
                                        className={errors.student_id ? 'border-red-500' : ''}
                                    />
                                    {errors.student_id && <p className="text-sm text-red-500">{errors.student_id}</p>}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end dark:border-slate-700">
                                    <Button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => window.history.back()}
                                        className="min-w-[140px] rounded-full border border-slate-200 bg-white px-6 font-medium text-slate-700 shadow-md transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="min-w-[140px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Additional Information Sidebar */}
                    <div className="space-y-6">
                        <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-center">
                                    <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                        <UserIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">About Your Profile</h3>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Your profile information is visible to other users on the platform. Make sure to keep your information up to date
                                    for the best experience.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Image Cropper Modal */}
            {showImageCropper && <ImageCropper onComplete={handleImageComplete} onCancel={() => setShowImageCropper(false)} />}
        </MainLayout>
    );
}
