import type { Thumbnail } from "../api/generated/models/Thumbnail.js";
import path, { join } from "node:path";
import fs from "node:fs";
import { readdir, readFile, stat, rm } from "node:fs/promises";
import sharp, { type OutputInfo, type ResizeOptions, type Sharp } from 'sharp';
import type {ImageSharpOptions} from "../types/image-sharp-options.types.js";
import {randomUUID} from "node:crypto";
import {ImageNotStoredException} from "../exceptions/ImageNotStoredException.js";
import {TooManyFilesException} from "../exceptions/TooManyFilesException.js";

export class PhotosManagerService {

    private readonly THUMBNAILS_PER_PAGE = 10;
    private readonly THUMBNAIL_SIZE = 200;
    private readonly IMAGE_WIDTH = 800;
    private readonly IMAGE_HEIGHT = 480;
    private readonly UPLOADS_DIR = 'uploads';
    private readonly PHOTOS_DIR = 'photos';
    private readonly THUMBNAILS_DIR = 'thumbnails';

    private readonly THUMBNAIL_SHARP_OPTIONS: ImageSharpOptions = {
        width: this.THUMBNAIL_SIZE,
        height: this.THUMBNAIL_SIZE,
        fit: "cover",
        position: "center"
    };

    private readonly PHOTO_SHARP_OPTIONS: ImageSharpOptions = {
        width: this.IMAGE_WIDTH,
        height: this.IMAGE_HEIGHT,
        fit: "contain",
        position: "center"
    };

    private getDirectoryPath(deviceId: string) {
        return path.resolve(process.cwd(), `${this.UPLOADS_DIR}/${deviceId}`);
    }

    private resizeImage(buffer: Buffer, options: ImageSharpOptions): Sharp {
        return sharp(buffer)
            .rotate() // utilise les metadata EXIF pour mettre l'image dans le bon sens
            .resize(options.width, options.height, {
                fit: options.fit,
                position: options.position,
            });
    }

    private storeFormattedImage(img: Sharp, filePath: string): Promise<OutputInfo> {
         return img.jpeg().toFile(filePath);
    }

    async handleUploadedPhoto(deviceId: string, buffer: Buffer): Promise<void> {
        // resize photo
        const path = `${this.getDirectoryPath(deviceId)}`;
        const uuid = randomUUID();
        const photoDirPath = `${path}/${this.PHOTOS_DIR}`;
        const photoPath = `${photoDirPath}/${uuid}.jpeg`;
        const thumbnailDirPath = `${path}/${this.THUMBNAILS_DIR}`;
        const thumbnailPath = `${thumbnailDirPath}/${uuid}.jpeg`;

        if (fs.existsSync(thumbnailDirPath)) {
            const entries = await readdir(thumbnailDirPath, { withFileTypes: true });
            if (entries.length >= 500) throw new TooManyFilesException("Too many photos.");
        }

        // store photo
        try {
            const rawPhoto = this.resizeImage(buffer, this.PHOTO_SHARP_OPTIONS);
            const rawThumbnail = this.resizeImage(buffer, this.THUMBNAIL_SHARP_OPTIONS);

            if (!fs.existsSync(photoDirPath)) { fs.mkdirSync(photoDirPath, { recursive: true }); }
            if (!fs.existsSync(thumbnailDirPath)) { fs.mkdirSync(thumbnailDirPath, { recursive: true }); }

            await this.storeFormattedImage(rawThumbnail, thumbnailPath);
            await this.storeFormattedImage(rawPhoto, photoPath);
        } catch (error) {
            await rm(thumbnailPath, { force: true });
            await rm(photoPath, { force: true });
            throw new ImageNotStoredException("Unable to store uploaded photo.");
        }
    }

    // retourne la liste des thumbnails liés à un device (paginée)
    async getThumbnailsForDevice(deviceId: string, page: number = 1): Promise<Thumbnail[]> {
        const dir = this.getDirectoryPath(deviceId);
        const thumbnailsDir = path.resolve(process.cwd(), `${dir}/${this.THUMBNAILS_DIR}`);

        if (!fs.existsSync(thumbnailsDir)) { return []; }

        const entries = await readdir(thumbnailsDir, { withFileTypes: true });
        const entriesNames = entries.filter(entry => entry.isFile()).map((entry) => entry.name);

        // récupérer les métadonnées (date de modif => mtimeMs)
        const entriesWithMetadata = await Promise.all(
            entriesNames.map(async(name) => {
                const fileStat = await stat(join(thumbnailsDir, name));
                return { name, date: fileStat.mtimeMs }
            })
        );

        entriesWithMetadata.sort((a, b) => b.date - a.date);

        // pagination
        const start = (page - 1) * this.THUMBNAILS_PER_PAGE;
        const paginatedEntries = entriesWithMetadata.slice(start, start + this.THUMBNAILS_PER_PAGE);

        return Promise.all(paginatedEntries
            .map(async (file) => {
                return {
                    id:  path.parse(file.name).name,
                    content: await readFile(`${thumbnailsDir}/${file.name}`, { encoding: 'base64' }),
                } satisfies Thumbnail
        })) ;
    }

    // retourne une photo spécifique
    getPhotoForDevice(deviceId: string, photoId: string) {

    }

    removePhotoForDevice(deviceId: string, photoId: string) {}
}