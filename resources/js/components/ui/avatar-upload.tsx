import { router } from '@inertiajs/react';
import { Camera, Loader2, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import 'react-image-crop/dist/ReactCrop.css';

interface AvatarUploadProps {
    currentAvatarUrl: string;
    userName: string;
    uploadUrl: string;
    onSuccess?: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export function AvatarUpload({ currentAvatarUrl, userName, uploadUrl, onSuccess }: AvatarUploadProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result as string);
            setIsOpen(true);
        });
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again
        e.target.value = '';
    }, []);

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }, []);

    const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
        if (!imgRef.current || !crop) return null;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const pixelCrop = {
            x: (crop.x / 100) * image.width * scaleX,
            y: (crop.y / 100) * image.height * scaleY,
            width: (crop.width / 100) * image.width * scaleX,
            height: (crop.height / 100) * image.height * scaleY,
        };

        // Set canvas size to desired output size (256x256 for avatar)
        const outputSize = 256;
        canvas.width = outputSize;
        canvas.height = outputSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outputSize, outputSize);

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                0.9
            );
        });
    }, [crop]);

    const handleUpload = useCallback(async () => {
        const blob = await getCroppedImg();
        if (!blob) {
            setError('Failed to crop image');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.jpg');

        router.post(uploadUrl, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                setImageSrc(null);
                setCrop(undefined);
                onSuccess?.();
            },
            onError: (errors) => {
                setError(errors.avatar || 'Failed to upload avatar');
            },
            onFinish: () => {
                setIsUploading(false);
            },
        });
    }, [getCroppedImg, uploadUrl, onSuccess]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setImageSrc(null);
        setCrop(undefined);
        setError(null);
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <div className="group relative">
                <Avatar className="size-24">
                    <AvatarImage src={currentAvatarUrl} alt={userName} />
                    <AvatarFallback className="text-lg">{getInitials(userName)}</AvatarFallback>
                </Avatar>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary text-primary-foreground absolute inset-0 flex cursor-pointer items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-90"
                    aria-label="Change avatar"
                >
                    <Camera className="size-6" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" aria-label="Upload avatar" />
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crop Avatar</DialogTitle>
                        <DialogDescription>Adjust the crop area to set your profile picture.</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-4">
                        {imageSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                aspect={1}
                                circularCrop
                                className="max-h-100"
                            >
                                <img
                                    ref={imgRef}
                                    src={imageSrc}
                                    alt="Crop preview"
                                    onLoad={onImageLoad}
                                    className="max-h-100 max-w-full"
                                />
                            </ReactCrop>
                        )}

                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
                            <X className="mr-2 size-4" />
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleUpload} disabled={isUploading || !crop}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                'Save Avatar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
