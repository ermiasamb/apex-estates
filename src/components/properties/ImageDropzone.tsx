'use client';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
    onDrop: (acceptedFiles: File[]) => void;
    className?: string;
    dropzoneOptions?: DropzoneOptions
}

export function ImageDropzone({ onDrop, className, dropzoneOptions }: ImageDropzoneProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, ...dropzoneOptions });

    return (
        <div
            {...getRootProps()}
            className={cn(
                'border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive ? 'bg-accent border-primary' : 'hover:bg-accent/50',
                className
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="w-10 h-10" />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag 'n' drop some files here, or click to select files</p>
                )}
            </div>
        </div>
    );
}
