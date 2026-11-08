export class ModelNotFoundException extends Error {
    constructor(message: string) {
        super(message ?? "ModelNotFoundException");
    }
}