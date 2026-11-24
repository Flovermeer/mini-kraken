export class TooManyFilesException extends Error {
    constructor(message: string) {
        super(message ?? "TooManyFilesException");
    }
}