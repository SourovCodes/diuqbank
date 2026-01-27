"use client";

import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PdfDropzoneProps {
    value: File | null;
    onChange: (file: File | null) => void;
    existingPdfUrl?: string | null;
    existingPdfName?: string | null;
    disabled?: boolean;
    error?: string;
    className?: string;
}

export function PdfDropzone({
    value,
    onChange,
    existingPdfUrl,
    existingPdfName,
    disabled = false,
    error,
    className,
}: PdfDropzoneProps) {
    const [isDragActive, setIsDragActive] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragActive(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === "application/pdf") {
                onChange(file);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onChange(files[0]);
        }
    };

    const handleRemove = () => {
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const displayFileName = value?.name || existingPdfName;
    const hasFile = value || (existingPdfUrl && !value);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className={cn("space-y-2", className)}>
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />

            {hasFile ? (
                <div
                    className={cn(
                        "relative flex items-center gap-3 rounded-lg border bg-card p-4",
                        error && "border-destructive"
                    )}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                            {displayFileName}
                        </p>
                        {value && (
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(value.size)}
                            </p>
                        )}
                        {existingPdfUrl && !value && (
                            <a
                                href={existingPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                            >
                                View current file
                            </a>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleRemove}
                        disabled={disabled}
                        className="shrink-0"
                    >
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                    </Button>
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
                        isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50",
                        error && "border-destructive",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <UploadCloudIcon
                            className={cn(
                                "h-6 w-6",
                                isDragActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        />
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm font-medium">
                            <span className="text-primary">
                                Click to upload
                            </span>{" "}
                            or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            PDF files only (max 10MB)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
