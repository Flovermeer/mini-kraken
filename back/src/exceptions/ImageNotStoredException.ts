export class ImageNotStoredException extends Error {
    constructor(message: string) {
        super(message ?? "ImageNotStoredException");
    }
}