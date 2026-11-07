const allowedMimeTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/bmp'
];

export function mimeTypeGuardFn(mime: string): boolean { 
    return allowedMimeTypes.includes(mime);
}

export function getAllowedMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    return allowedMimeTypes.find(mime => {
        let mimeExt = mime.split('/')[1];
        if (mimeExt === 'jpg') mimeExt = 'jpeg'; // Normalize jpg to jpeg
        return mimeExt;
    }) || 'application/octet-stream';
}